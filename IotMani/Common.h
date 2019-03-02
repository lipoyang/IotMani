// LEDピン
#define LED_BLUE    12
#define LED_ORANGE  13
#define LED_GREEN   14
#define LED_RED     16

// LEDのON/OFF (負論理)
#define LED_ON(x)     digitalWrite(x, LOW)
#define LED_OFF(x)    digitalWrite(x, HIGH)
#define LED_TOGGLE(x) digitalWrite(x, 1 - digitalRead(x))
