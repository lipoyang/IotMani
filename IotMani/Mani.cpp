// マニ車の回転検出 (IMUセンサ MPU-6050使用)

#include <Wire.h>
#include <I2Cdev.h>
#include <MPU6050.h>
#include "Common.h"

// 6軸センサ MPU6050
MPU6050 accelgyro;

// ミリ秒をクロック数に換算 (@80MHz)
#define MSEC2CLOCK(ms)      (ms * 80000L)
// 割り込み周期 (下記サンプル時間Δtに相当)
const uint32_t INTERVAL = 10; // 10msec

// サンプル時間Δt[sec]
const float dT = 0.010; // 0.010 = 10msec
// 角速度閾値(これ未満は静止とみなす)
const int16_t G0 = 128;

// 角度(積分値)
static float th = 0;
// マニ車回転カウンタ
static int mani_cnt = 0;
// マニ車カウントアップ/ダウンフラグ
static bool mani_flag = false;

// LED点灯状態
static int led_state = 0;
// LED点灯時間
const int LED_TIME = 300; // 10msec単位
static int led_cnt = 0;

// タイマ割り込みハンドラ
static void timer0_ISR (void)
{
    timer0_write(ESP.getCycleCount() + MSEC2CLOCK(INTERVAL) );
    
#if 0
    // 時間計測テスト用
    static int tgl = 1;
    digitalWrite(14, tgl);
    tgl = 1 - tgl;
#endif
#if 0
    // 時間計測テスト用
    digitalWrite(14, 1);
#endif
    
    // 加速度と角速度
    int16_t ax, ay, az;
    int16_t gx, gy, gz;
    accelgyro.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    
    // ジャイロの積分
    int16_t g = gy;  // Y軸の回転を検出
    if(abs(g) > G0){
        float omg = (float)g / 32768 * 2000; // フルスケール±2000deg/sec
        th += omg * dT;
    }
    
    // 回転カウント
    if(th > 360){
        th -= 360;
        mani_cnt++;
        mani_flag = true;
        
        led_state++;
        if(led_state > 4) led_state = 1;
        led_cnt = LED_TIME;
    }else if(th < -360){
        th += 360;
        mani_cnt--;
        mani_flag = true;
        
        led_state--;
        if(led_state < 1) led_state = 4;
        led_cnt = LED_TIME;
    }
    
    // LED点灯
    if(led_state != 0){
        switch(led_state){
            case 1:
                LED_OFF(LED_BLUE);
                LED_OFF(LED_ORANGE);
                LED_OFF(LED_GREEN);
                LED_ON(LED_RED);
                break;
            case 2:
                LED_OFF(LED_BLUE);
                LED_OFF(LED_ORANGE);
                LED_ON(LED_GREEN);
                LED_OFF(LED_RED);
                break;
            case 3:
                LED_OFF(LED_BLUE);
                LED_ON(LED_ORANGE);
                LED_OFF(LED_GREEN);
                LED_OFF(LED_RED);
                break;
            case 4:
                LED_ON(LED_BLUE);
                LED_OFF(LED_ORANGE);
                LED_OFF(LED_GREEN);
                LED_OFF(LED_RED);
                break;
        }
        led_cnt--;
        if(led_cnt < 0){
            LED_OFF(LED_BLUE);
            LED_OFF(LED_ORANGE);
            LED_OFF(LED_GREEN);
            LED_OFF(LED_RED);
            led_state = 0;
        }
    }
    
#if 0
    // 時間計測テスト用
    digitalWrite(14, 0);
#endif
}

// マニ車回転検出の初期化
void Mani_init()
{
    // 6軸センサの初期化 (ジャイロのフルスケール±2000deg/sec)
    Wire.begin();
    accelgyro.initialize();
    accelgyro.setFullScaleGyroRange(MPU6050_GYRO_FS_2000);

    // タイマ割り込みの設定
    noInterrupts();
    timer0_isr_init();
    timer0_attachInterrupt(timer0_ISR);
    timer0_write(ESP.getCycleCount() + MSEC2CLOCK(INTERVAL) );
    interrupts();
}

// マニ車のカウント値の変化をチェック
bool Mani_check()
{
    if(mani_flag){
        mani_flag = false;
        return true;
    }else{
        return false;
    }
}

// マニ車のカウント値を取得
int Mani_get()
{
    return mani_cnt;
}
