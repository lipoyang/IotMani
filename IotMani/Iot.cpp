// IoT通信処理 (MQTT)

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "Setting.h"

// WiFi設定
const char* ssid     = WIFI_SSID;
const char* password = WIFI_PASS;
// MQTTサーバー(ブローカー)設定
const char* mqtt_server = MQTT_SERVER_ADDR;
const int   mqtt_port   = MQTT_SSL_PORT;

// MQTTクライアント
WiFiClientSecure espClient;
PubSubClient client(espClient);

// WiFiの設定
void wifi_setup()
{
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);
    
    // WiFiの接続開始
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

// MQTTの受信コールバック
void callback(char* topic, byte* payload, unsigned int length)
{
    // 受信内容のシリアル出力 (テスト用)
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}

// MQTTの接続
void mqtt_connect()
{
    // 接続されるまで
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        // クライアントIDを乱数で生成
        String clientId = "ESP8266Client-";
        clientId += String(random(0xffff), HEX);
        // 接続を試行
        if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
            Serial.println("connected");
            // 接続したら通知を送信 (テスト用)
            client.publish("info", "connected!");
            // 受信を開始 (テスト用)
            client.subscribe("inTopic"); // トピック名"inTopic"の受信
        } else {
            // 接続に失敗したら5秒後に再試行
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

// 初期化
void IoT_init()
{
    // WiFiの初期化
    wifi_setup();
    // 乱数の初期化
    randomSeed(micros());
    // MQTTクライアントの初期化
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}

// メインループ処理
void IoT_loop()
{
    // MQTTが接続されていなければ接続
    if (!client.connected()) {
        mqtt_connect();
    }
    // MQTTのループ処理
    client.loop();
}

// データ送信(文字列)
void IoT_send(char* topic, char* msg)
{
    Serial.print("publish ");
    Serial.print(topic);
    Serial.print(":");
    Serial.println(msg);

    client.publish(topic, msg);
}

// データ送信(整数)
void IoT_send(char* topic, int val)
{
    static char msg[16];
    snprintf (msg, 16, "%ld", val);
    IoT_send(topic, msg);
}
