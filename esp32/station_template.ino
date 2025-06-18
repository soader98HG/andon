#include <WiFi.h>
#include <PubSubClient.h>

// Replace with your WiFi credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASS";

// MQTT broker
const char* mqttServer = "MQTT_BROKER_IP"; // e.g. 192.168.137.149
const int   mqttPort   = 1883;

// Unique station id
const char* STATION_ID = "1"; // change per station

WiFiClient espClient;
PubSubClient client(espClient);

void setupWiFi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String msg = String((char*)payload);
  if (msg == "rojo") {
    // TODO: turn on red light
  } else if (msg == "amarillo") {
    // TODO: turn on yellow light
  } else if (msg == "verde") {
    // TODO: turn on green light
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect(STATION_ID)) {
      String topic = String("andon/station/") + STATION_ID + "/state";
      client.subscribe(topic.c_str());
    } else {
      delay(5000);
    }
  }
}

void setup() {
  setupWiFi();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
