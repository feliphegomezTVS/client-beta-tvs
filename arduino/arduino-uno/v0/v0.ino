#define MaximumEventNameLength 24
#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

int counter = 0;

void setup() {
  Serial.begin(9600);
  WebSerial.on("ping", [](JSONVar data) {
    counter++;
    WebSerial.send("pong", counter);
  });
}

void loop() {
  WebSerial.check();
}
