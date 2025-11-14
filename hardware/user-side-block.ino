/*
 * AERAS - User-Side Location Block
 * Hardware: ESP32 or Arduino with WiFi
 * 
 * Components:
 * - Ultrasonic Sensor (HC-SR04) - Distance detection
 * - LDR Sensor - Laser frequency detection
 * - Button - Confirmation
 * - LED Indicators (Yellow, Red, Green)
 * - OLED Display (SSD1306)
 * - Buzzer (optional)
 * 
 * Pin Configuration:
 * - Ultrasonic: Trig=GPIO5, Echo=GPIO18
 * - LDR: GPIO34 (ADC)
 * - Button: GPIO19
 * - Yellow LED: GPIO21
 * - Red LED: GPIO22
 * - Green LED: GPIO23
 * - OLED: SDA=GPIO21, SCL=GPIO22 (I2C)
 * - Buzzer: GPIO25
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* backendUrl = "http://YOUR_BACKEND_URL/api";

// Pin Definitions
#define TRIG_PIN 5
#define ECHO_PIN 18
#define LDR_PIN 34
#define BUTTON_PIN 19
#define YELLOW_LED 21
#define RED_LED 22
#define GREEN_LED 23
#define BUZZER_PIN 25

// Location Block Configuration
const char* blockId = "block_cuet";  // Change for each block
const char* locationId = "loc_1";    // Change for each location

// Sensor Thresholds
const float MAX_DISTANCE = 10.0;     // meters
const unsigned long PRESENCE_TIME = 3000;  // 3 seconds in milliseconds
const int LASER_FREQUENCY_THRESHOLD = 500; // LDR reading threshold

// OLED Display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// State Variables
enum SystemState {
  IDLE,
  DETECTING_PRESENCE,
  WAITING_LASER,
  WAITING_CONFIRMATION,
  REQUEST_SENT,
  WAITING_RESPONSE,
  RIDE_ACCEPTED,
  RIDE_REJECTED,
  RIDE_COMPLETED
};

SystemState currentState = IDLE;
unsigned long presenceStartTime = 0;
bool presenceDetected = false;
bool laserVerified = false;
bool buttonPressed = false;
String currentRideId = "";
String destinationLocationId = "";

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("AERAS System");
  display.println("Initializing...");
  display.display();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("AERAS Ready");
  display.println("Block: " + String(blockId));
  display.println("Stand on block");
  display.println("to request ride");
  display.display();
  
  // Initialize LEDs
  allLEDsOff();
}

void loop() {
  float distance = readUltrasonicDistance();
  int ldrValue = analogRead(LDR_PIN);
  bool buttonState = !digitalRead(BUTTON_PIN);  // Inverted due to pullup
  
  // State Machine
  switch(currentState) {
    case IDLE:
      handleIdleState(distance);
      break;
      
    case DETECTING_PRESENCE:
      handleDetectingPresence(distance);
      break;
      
    case WAITING_LASER:
      handleWaitingLaser(ldrValue);
      break;
      
    case WAITING_CONFIRMATION:
      handleWaitingConfirmation(buttonState);
      break;
      
    case REQUEST_SENT:
      handleRequestSent();
      break;
      
    case WAITING_RESPONSE:
      checkRideStatus();
      break;
      
    case RIDE_ACCEPTED:
      // Ride accepted - Green LED already on
      break;
      
    case RIDE_REJECTED:
      // Ride rejected - Red LED already on
      delay(5000);
      resetSystem();
      break;
      
    case RIDE_COMPLETED:
      delay(5000);
      resetSystem();
      break;
  }
  
  delay(100);  // Small delay for stability
}

void handleIdleState(float distance) {
  if (distance > 0 && distance <= MAX_DISTANCE) {
    presenceStartTime = millis();
    currentState = DETECTING_PRESENCE;
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Presence detected");
    display.println("Distance: " + String(distance) + "m");
    display.display();
  }
}

void handleDetectingPresence(float distance) {
  if (distance > 0 && distance <= MAX_DISTANCE) {
    unsigned long elapsed = millis() - presenceStartTime;
    if (elapsed >= PRESENCE_TIME) {
      presenceDetected = true;
      currentState = WAITING_LASER;
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Presence confirmed");
      display.println("Direct laser at LDR");
      display.display();
      playBuzzer(200);  // Short beep
    }
  } else {
    // Person moved away
    resetSystem();
  }
}

void handleWaitingLaser(int ldrValue) {
  if (ldrValue > LASER_FREQUENCY_THRESHOLD) {
    laserVerified = true;
    currentState = WAITING_CONFIRMATION;
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Laser verified!");
    display.println("Select destination:");
    display.println("1. Pahartoli");
    display.println("2. Noapara");
    display.println("3. Raojan");
    display.println("Press button");
    display.display();
    playBuzzer(300);  // Confirmation beep
  }
}

void handleWaitingConfirmation(bool buttonState) {
  if (buttonState && !buttonPressed) {
    buttonPressed = true;
    // For demo: default to Pahartoli (loc_2)
    // In real implementation, use multiple buttons or selection mechanism
    destinationLocationId = "loc_2";  // Pahartoli
    
    currentState = REQUEST_SENT;
    sendRideRequest();
    playBuzzer(500);  // Long beep
  }
}

void sendRideRequest() {
  HTTPClient http;
  http.begin(backendUrl + "/rides");
  http.addHeader("Content-Type", "application/json");
  
  // Create request body
  StaticJsonDocument<200> doc;
  doc["userId"] = "user_" + String(blockId);  // Generate or use stored user ID
  doc["pickupLocationId"] = locationId;
  doc["destinationLocationId"] = destinationLocationId;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode == 201) {
    String response = http.getString();
    StaticJsonDocument<200> responseDoc;
    deserializeJson(responseDoc, response);
    
    if (responseDoc.containsKey("ride")) {
      currentRideId = responseDoc["ride"]["id"].as<String>();
      currentState = WAITING_RESPONSE;
      
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Request sent!");
      display.println("Waiting for");
      display.println("puller...");
      display.display();
    }
  } else {
    Serial.println("Error sending request: " + String(httpResponseCode));
    currentState = RIDE_REJECTED;
    digitalWrite(RED_LED, HIGH);
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Request failed!");
    display.display();
  }
  
  http.end();
}

void checkRideStatus() {
  if (currentRideId == "") return;
  
  HTTPClient http;
  http.begin(backendUrl + "/rides/" + currentRideId);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    StaticJsonDocument<500> doc;
    deserializeJson(doc, response);
    
    String status = doc["ride"]["status"].as<String>();
    
    if (status == "accepted") {
      currentState = RIDE_ACCEPTED;
      allLEDsOff();
      digitalWrite(YELLOW_LED, HIGH);
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Ride accepted!");
      display.println("Puller coming...");
      display.display();
    } else if (status == "pickup_confirmed") {
      allLEDsOff();
      digitalWrite(GREEN_LED, HIGH);
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Pickup confirmed!");
      display.println("Enjoy your ride");
      display.display();
    } else if (status == "completed") {
      currentState = RIDE_COMPLETED;
      allLEDsOff();
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Ride completed!");
      display.println("Thank you!");
      display.display();
      playBuzzer(1000);
    } else if (status == "rejected" || status == "cancelled") {
      currentState = RIDE_REJECTED;
      allLEDsOff();
      digitalWrite(RED_LED, HIGH);
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Ride rejected");
      display.println("or cancelled");
      display.display();
    }
  }
  
  http.end();
}

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout
  if (duration == 0) return -1;  // No echo received
  
  float distance = (duration * 0.034) / 2;  // Convert to meters
  return distance;
}

void allLEDsOff() {
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, LOW);
}

void playBuzzer(int duration) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(duration);
  digitalWrite(BUZZER_PIN, LOW);
}

void resetSystem() {
  currentState = IDLE;
  presenceDetected = false;
  laserVerified = false;
  buttonPressed = false;
  currentRideId = "";
  destinationLocationId = "";
  allLEDsOff();
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("AERAS Ready");
  display.println("Block: " + String(blockId));
  display.println("Stand on block");
  display.println("to request ride");
  display.display();
}

