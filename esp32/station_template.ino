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

// LED Pins (Adjust these to your ESP32 board's GPIO pins)
const int RED_LED_PIN = 2;    // Example GPIO pin for Red LED
const int YELLOW_LED_PIN = 4; // Example GPIO pin for Yellow LED
const int GREEN_LED_PIN = 16; // Example GPIO pin for Green LED

WiFiClient espClient;
PubSubClient client(espClient);

void setBeaconColor(String color) {
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

  if (color == "rojo") {
    digitalWrite(RED_LED_PIN, HIGH);
    Serial.println("Beacon state: RED");
  } else if (color == "amarillo") {
    digitalWrite(YELLOW_LED_PIN, HIGH);
    Serial.println("Beacon state: YELLOW");
  } else if (color == "verde") {
    digitalWrite(GREEN_LED_PIN, HIGH);
    Serial.println("Beacon state: GREEN");
  } else {
    Serial.println("Unknown color received: " + color);
  }
}

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String msg = String((char*)payload);
  Serial.print("Message arrived [" + String(topic) + "]: ");
  Serial.println(msg);
  setBeaconColor(msg);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(STATION_ID)) {
      Serial.println("connected");
      String topic = String("andon/station/") + STATION_ID + "/state";
      client.subscribe(topic.c_str());
      Serial.println("Subscribed to topic: " + topic);
      // Request initial state from server
      String requestTopic = String("andon/station/") + STATION_ID + "/request_state";
      client.publish(requestTopic.c_str(), "request");
      Serial.println("Requested initial state on topic: " + requestTopic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200); // Initialize serial communication
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

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
