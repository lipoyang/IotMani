# IoTマニ車

マニ車を回すとクラウドサーバ上に功徳が積まれ、ブラウザでチェックできます。

<!-- ![写真](image/iotmani.jpg) -->
<!-- 動画 -->

## ハードウェア
* WiFiマイコン: ESP8266 (ESPr Developerボード)
* IMUセンサ: MPU-6050 (上位互換のMPU-9250のブレークアウト基板を使用)
* 電源: LiPoバッテリー 1000mAh 1セル

![回路図](image/circuit.png)

<!-- ![写真](image/hard.jpg) -->

## ファームウェア
### Arduinoスケッチ
* IotMani/IotMani.ino
* IotMani/Mani.cpp : マニ車回転検出処理
* IotMani/Iot.cpp : IoT通信処理
* IotMani/Setting.h : WiFiとMQTTの設定。(架空のものに変更されています。)
### 依存ライブラリ
* [I2Cdev](https://github.com/jrowberg/i2cdevlib/tree/master/Arduino/I2Cdev) : 下記MPU6050ライブラリが依存
* [MPU6050](https://github.com/jrowberg/i2cdevlib/tree/master/Arduino/MPU6050) : IMUセンサMPU-6050ドライバ
* [pubsubclient](https://github.com/knolleary/pubsubclient) : MQTTクライアント
### 般若心経
* 紙のお経の代わりに、ESP8266のROM内に般若心経を納めました。
 
## バックエンド
* Heroku上にNode-REDで構築 (ボタンからアプリ作成)
* MQTTブローカーはCloudMQTTを使用 (Herokuのアドオンから使用)
<!--
### Node-REDのフロー
* nodered/iotmani. TODO (パスワード等は架空のものに変更されています)
![フロー](image/flow.png)
-->

## フロントエンド
* Node-REDを簡易Webサーバとしてホスティング
* URLは https://アプリ名.herokuapp.com/cnt/index.html

### HTML
* web/index.html
* web/iotmani.js

