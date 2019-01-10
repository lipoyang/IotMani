// IoTマニ車  (ESP8266 + MPU-6050 使用)

// 般若心経
const char SUTRA[] =
"摩訶般若波羅蜜多心経"
"観自在菩薩行深般若波羅蜜多時照見五蘊皆空度一切苦厄舎利子色不異空空不異色色即是空"
"空即是色受想行識亦復如是舎利子是諸法空相不生不滅不垢不浄不増不減是故空中無色無受"
"想行識無眼耳鼻舌身意無色声香味触法無眼界乃至無意識界無無明亦無無明尽乃至無老死亦"
"無老死尽無苦集滅道無智亦無得以無所得故菩提薩埵依般若波羅蜜多故心無罣礙無罣礙故無"
"有恐怖遠離一切顛倒夢想究竟涅槃三世諸仏依般若波羅蜜多故得阿耨多羅三藐三菩提故知般"
"若波羅蜜多是大神呪是大明呪是無上呪是無等等呪能除一切苦真実不虚故説般若波羅蜜多呪"
"即説呪曰"
"羯諦羯諦波羅羯諦波羅僧羯諦菩提薩婆訶"
"般若心経";

// マニ車の回転検出
void Mani_init();   // 初期化
bool Mani_check();  // マニ車カウント値の変化をチェック
int  Mani_get();    // マニ車カウント値を取得

// IoT通信処理
void IoT_init();    // 初期化
void IoT_loop();    // メインループ処理
void IoT_send(char* topic, char* msg); // データ送信(文字列)
void IoT_send(char* topic, int val);   // データ送信(整数)

// 初期化
void setup()
{
    delay(10);
    Serial.begin(115200);
#if 0
    // テスト用
    pinMode(BUILTIN_LED, OUTPUT);
    pinMode(14, OUTPUT);
#endif
    // 般若心経を転読
    for(int i=0;i<sizeof(SUTRA);i++) volatile char sutra = SUTRA[i];
    
    // マニ車回転検出の初期化
    Mani_init();
    // IoT通信処理の初期化
    IoT_init();
}

// メインループ
void loop()
{
    // IoT通信処理
    IoT_loop();
    
    // マニ車のカウント変化した？
    if(Mani_check())
    {
        // 前回のカウント値からの変化分を求める
        static int prev_cnt = 0;
        int cnt = Mani_get(); // マニ車のカウント値
        int diff = cnt - prev_cnt;
        prev_cnt = cnt;
        // 送信
        IoT_send("mani_cnt", diff);
    }

#if 0
    // テスト用
    static long last_time = 0;
    static int value = 0;
    // 2秒に1回送信
    long now = millis();
    if (now - last_time > 2000) {
        last_time = now;
        ++value;
        // 送信
        IoT_send("info", value);
    }
#endif
}
