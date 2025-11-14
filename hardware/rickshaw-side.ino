/*
 * AERAS - Rickshaw-Side System
 * Hardware: ESP32 with WiFi and GPS Module
 * 
 * Components:
 * - GPS Module (NEO-6M or similar)
 * - OLED Display (SSD1306)
 * - WiFi Module (built-in ESP32)
 * 
 * Pin Configuration:
 * - GPS: RX=GPIO16, TX=GPIO17
 * - OLED: SDA=GPIO21, SCL=GPIO22 (I2C)
 * 
 * Note: This code runs on ESP32 and communicates with the web backend.
 * The web UI (rickshaw portal) handles most of the interaction,
 * but this code can be used for standalone OLED display updates.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include <SoftwareSerial.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* backendUrl = "http://YOUR_BACKEND_URL/api";

// GPS Configuration
SoftwareSerial gpsSerial(16, 17);  // RX, TX

// OLED Display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Puller Configuration
const char* pullerId = "puller_123";  // Change for each rickshaw
float currentLatitude = 0.0;
float currentLongitude = 0.0;
String activeRideId = "";

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  
  // Initialize OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("AERAS Rickshaw");
  display.println("Initializing...");
  display.display();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("AERAS Rickshaw");
  display.println("Puller ID:");
  display.println(pullerId);
  display.println("Online");
  display.display();
  
  // Set puller online status
  setPullerOnline(true);
}

void loop() {
  // Update GPS location
  updateGPSLocation();
  
  // Send location to backend
  if (currentLatitude != 0.0 && currentLongitude != 0.0) {
    updatePullerLocation();
  }
  
  // Check for active ride and update display
  checkActiveRide();
  
  delay(5000);  // Update every 5 seconds
}

void updateGPSLocation() {
  // Parse GPS data (simplified - use proper NMEA parser in production)
  if (gpsSerial.available()) {
    String gpsData = gpsSerial.readStringUntil('\n');
    
    // Example NMEA parsing (simplified)
    // In production, use a proper GPS library like TinyGPS++
    if (gpsData.startsWith("$GPGGA")) {
      // Parse GPGGA sentence for latitude/longitude
      // This is simplified - use proper parsing library
      // For demo, you can manually set coordinates:
      currentLatitude = 22.4633;  // CUET Campus
      currentLongitude = 91.9714;
    }
  }
}

void updatePullerLocation() {
  HTTPClient http;
  http.begin(backendUrl + "/pullers/" + String(pullerId));
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["latitude"] = currentLatitude;
  doc["longitude"] = currentLongitude;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  http.PATCH(requestBody);
  http.end();
}

void setPullerOnline(bool online) {
  HTTPClient http;
  http.begin(backendUrl + "/pullers/" + String(pullerId));
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<100> doc;
  doc["isOnline"] = online;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  http.PATCH(requestBody);
  http.end();
}

void checkActiveRide() {
  HTTPClient http;
  http.begin(backendUrl + "/rides?pullerId=" + String(pullerId));
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    StaticJsonDocument<2000> doc;
    deserializeJson(doc, response);
    
    JsonArray rides = doc["rides"].as<JsonArray>();
    
    // Find active ride
    for (JsonObject ride : rides) {
      String status = ride["status"].as<String>();
      if (status == "accepted" || status == "pickup_confirmed" || status == "in_progress") {
        activeRideId = ride["id"].as<String>();
        updateDisplayWithRide(ride);
        return;
      }
    }
    
    // No active ride
    activeRideId = "";
    displayNoActiveRide();
  }
  
  http.end();
}

void updateDisplayWithRide(JsonObject ride) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  
  String status = ride["status"].as<String>();
  String pickupLoc = ride["pickupLocationId"].as<String>();
  String destLoc = ride["destinationLocationId"].as<String>();
  
  display.println("ACTIVE RIDE");
  display.println("-----------");
  display.println("From: " + pickupLoc);
  display.println("To: " + destLoc);
  display.println("Status: " + status);
  
  if (currentLatitude != 0.0) {
    display.println("GPS: OK");
  } else {
    display.println("GPS: No signal");
  }
  
  display.display();
}

void displayNoActiveRide() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println("AERAS Rickshaw");
  display.println("Puller: " + String(pullerId));
  display.println("");
  display.println("No active ride");
  display.println("Waiting for");
  display.println("requests...");
  display.display();
}

