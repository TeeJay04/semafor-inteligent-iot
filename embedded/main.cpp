#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "test.mosquitto.org";

// LED pins
#define RED 5
#define YELLOW 18
#define GREEN 19

// Ultrasonic sensor pins
#define TRIG 12
#define ECHO 14

// Button
#define PED_BUTTON 4

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;

void setup_wifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  char cmd = payload[0];

  if (cmd == 'R') {
    digitalWrite(RED, HIGH);
    digitalWrite(YELLOW, LOW);
    digitalWrite(GREEN, LOW);
  }
  else if (cmd == 'G') {
    digitalWrite(RED, LOW);
    digitalWrite(YELLOW, LOW);
    digitalWrite(GREEN, HIGH);
  }
  else if (cmd == 'Y') {
    digitalWrite(RED, LOW);
    digitalWrite(YELLOW, HIGH);
    digitalWrite(GREEN, LOW);
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32-Semafor")) {
      client.subscribe("traffic/controller/state");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(GREEN, OUTPUT);

  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);

  pinMode(PED_BUTTON, INPUT_PULLUP);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  // Init semafor: verde
  digitalWrite(GREEN, HIGH);
}

int readVehicleDistance() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duration = pulseIn(ECHO, HIGH);
  int distance = duration * 0.034 / 2;

  return distance;
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // detect vehicle distance
  int distance = readVehicleDistance();

  if (distance > 0 && distance < 25) {
    client.publish("traffic/sensor/vehicle_count", "1");
  }

  // detect pedestrian button
  if (!digitalRead(PED_BUTTON)) {
    client.publish("traffic/sensor/pedestrian_button", "pressed");
    delay(300); // debounce
  }

  delay(200);
}
