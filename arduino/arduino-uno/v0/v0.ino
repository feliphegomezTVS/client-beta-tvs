#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

int lastMillis = 0;

void setup() {
  Serial.begin(1000000);
}

void loop() {
  lastMillis = millis();
  WebSerial.send("latency-device-client", millis() - lastMillis);

  // char str[80];
  // sprintf(str, "It has been %lu ms since Arduino has started this program!", millis());
  // WebSerial.send("log", str);
  delay(1);        // delay in between reads for stability
}
