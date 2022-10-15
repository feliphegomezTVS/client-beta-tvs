#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

long pings = 0;

void setup() {
  Serial.begin(57600);
  
  WebSerial.on("test-latency", [](JSONVar data) {
    WebSerial.send("test-latency-response", pings);
    pings++;
  });
}

void loop() {
  WebSerial.check();
  delay(5);        // delay in between reads for stability
}

void test_log(JSONVar dataIn) {
  WebSerial.send("log", "testing log!");
}
