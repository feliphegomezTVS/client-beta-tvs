#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

int lastMillis = 0;

void setup() {
  Serial.begin(1000000);
  WebSerial.on("latency-device", lat_dev_cli);
}

void loop() {
  lastMillis = millis();
  WebSerial.check();
  // char str[80];
  // sprintf(str, "It has been %lu ms since Arduino has started this program!", millis());
  // WebSerial.send("log", str);
  delay(5);        // delay in between reads for stability
}

void lat_dev_cli(JSONVar dataIn) {
  WebSerial.send("latency-device", millis() - lastMillis);
}
