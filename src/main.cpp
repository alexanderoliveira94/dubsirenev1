#include <Arduino.h>

#define VOLUME_POT 34

void setup()
{
    Serial.begin(115200);

    pinMode(VOLUME_POT, INPUT);
    analogReadResolution(12);

    Serial.println("Teste do potenciometro");
}

void loop()
{
    int pot = analogRead(VOLUME_POT);

    Serial.print("ADC = ");
    Serial.println(pot);

    delay(100);
}