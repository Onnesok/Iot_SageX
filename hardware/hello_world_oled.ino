/*
 * AERAS - 1.3" OLED Display with Sensors
 * ESP32-C3 Compatible Version
 * 
 * Hardware: ESP32-C3
 * Display: 1.3" OLED Display (128x64) via I2C
 * Driver: SH1106
 * Sensors:
 * - Ultrasonic Sensor (HC-SR04) - Distance detection
 * - LDR (Light Dependent Resistor) - Light detection
 * - 3 LEDs (Red, Green, Blue/Yellow) - Status indicators
 * 
 * Pin Configuration for ESP32-C3:
 * - OLED SDA: GPIO 20
 * - OLED SCL: GPIO 21
 * - Ultrasonic Trig: GPIO 2
 * - Ultrasonic Echo: GPIO 3
 * - LDR: GPIO 0 (ADC - A0)
 * - LED 1 (Red): GPIO 4
 * - LED 2 (Green): GPIO 5
 * - LED 3 (Blue/Yellow): GPIO 6
 * 
 * Required Libraries:
 * - Adafruit_SH110X (install via Library Manager)
 * - Adafruit_GFX (install via Library Manager)
 * - Wire (built-in)
 * 
 * Shows "AERAS" splash screen on startup (like Adafruit logo)
 * Then displays sensor readings and status on OLED
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// I2C Pin Configuration for ESP32-C3
#define I2C_SDA 20
#define I2C_SCL 21

/* Uncomment the initialize the I2C address, uncomment only one
   If you get a totally blank screen try the other */
#define i2c_Address 0x78   // Initialize with the I2C addr 0x78 (most common for 1.3" displays - eBay OLEDs)
//#define i2c_Address 0x3C  // Initialize with the I2C addr 0x3C (alternative)
//#define i2c_Address 0x3D  // Initialize with the I2C addr 0x3D (Adafruit OLEDs)

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define OLED_RESET -1    // Reset pin (-1 if not used)

// Sensor Pin Definitions
#define TRIG_PIN 2      // Ultrasonic Trig pin (GPIO 2)
#define ECHO_PIN 3      // Ultrasonic Echo pin (GPIO 3)
#define LDR_PIN 0       // LDR analog pin (GPIO 0 - ADC)
#define LED1_PIN 4      // LED 1 (Red) - GPIO 4
#define LED2_PIN 5      // LED 2 (Green) - GPIO 5
#define LED3_PIN 6      // LED 3 (Blue/Yellow) - GPIO 6

// Sensor Configuration
#define MAX_DISTANCE 400    // Maximum distance in cm for ultrasonic sensor
#define LDR_THRESHOLD 500   // LDR threshold value (adjust based on your setup)

Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== AERAS - ESP32-C3 with OLED and Sensors ===");
  
  // Initialize sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  pinMode(LDR_PIN, INPUT);  // Analog input
  
  // Initialize all LEDs to OFF
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  digitalWrite(LED3_PIN, LOW);
  
  Serial.println("Pins initialized:");
  Serial.println("  Ultrasonic: Trig=GPIO2, Echo=GPIO3");
  Serial.println("  LDR: GPIO0 (ADC)");
  Serial.println("  LED1 (Red): GPIO4");
  Serial.println("  LED2 (Green): GPIO5");
  Serial.println("  LED3 (Blue/Yellow): GPIO6");
  
  // CRITICAL: Initialize I2C FIRST with custom pins for ESP32-C3
  Serial.print("Initializing I2C on SDA=");
  Serial.print(I2C_SDA);
  Serial.print(", SCL=");
  Serial.println(I2C_SCL);
  
  Wire.begin(I2C_SDA, I2C_SCL);
  delay(100);  // Give I2C time to stabilize
  
  // Scan I2C bus to find display address
  Serial.println("\nScanning I2C bus...");
  byte error, address;
  int nDevices = 0;
  uint8_t foundAddress = 0;
  
  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    if (error == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
      nDevices++;
      if (address == 0x3C || address == 0x78 || address == 0x3D) {
        foundAddress = address;
      }
    }
  }
  
  if (nDevices == 0) {
    Serial.println("ERROR: No I2C devices found!");
    Serial.println("Check wiring: SDA=GPIO20, SCL=GPIO21");
    for (;;);
  }
  
  if (foundAddress == 0) {
    Serial.println("WARNING: No OLED found at 0x3C, 0x78, or 0x3D");
    Serial.println("Trying address 0x3C anyway...");
    foundAddress = 0x3C;
  } else {
    Serial.print("Found OLED at address 0x");
    Serial.println(foundAddress, HEX);
  }
  
  // Wait for the OLED to power up
  delay(250);
  
  // Initialize the display - try addresses in order of likelihood
  // Note: 0x78 is the 7-bit address (0x3C) left-shifted, which some libraries expect
  Serial.println("\nInitializing SH1106 display...");
  bool initSuccess = false;
  uint8_t addresses[] = {i2c_Address, 0x78, 0x3C, 0x3D};  // Try user-defined address first, then common addresses
  
  for (int i = 0; i < 4; i++) {
    uint8_t addr = addresses[i];
    Serial.print("Trying address 0x");
    Serial.print(addr, HEX);
    Serial.println("...");
    
    if (display.begin(addr, true)) {
      Serial.print("SUCCESS! Display initialized at 0x");
      Serial.println(addr, HEX);
      initSuccess = true;
      break;
    }
    delay(100);
  }
  
  if (!initSuccess) {
    Serial.println("\nERROR: Could not initialize display!");
    Serial.println("Please check:");
    Serial.println("1. Wiring: SDA=GPIO20, SCL=GPIO21");
    Serial.println("2. Power supply (3.3V or 5V)");
    Serial.println("3. Try changing i2c_Address to 0x78 in the code");
    Serial.println("4. Verify display is powered on");
    for (;;);
  }
  
  // Show AERAS startup splash screen (like Adafruit logo)
  display.clearDisplay();
  display.setTextSize(3);           // Larger text for splash screen
  display.setTextColor(SH110X_WHITE);
  display.setCursor(15, 28);        // Centered position for "AERAS"
  display.println("AERAS");
  display.display();  // Show AERAS splash screen
  delay(2000);  // Display AERAS for 2 seconds (like Adafruit logo)
  
  Serial.println("\n=== AERAS splash screen displayed ===");
  
  // Test LEDs on startup
  Serial.println("Testing LEDs...");
  testLEDs();
  
  Serial.println("=== Setup complete! Starting sensor readings... ===");
}

void loop() {
  // Read sensor values
  float distance = readUltrasonicDistance();
  int ldrValue = analogRead(LDR_PIN);
  
  // Print sensor values to Serial
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.print(" cm | LDR: ");
  Serial.println(ldrValue);
  
  // Control LEDs based on sensor readings
  controlLEDs(distance, ldrValue);
  
  // Update OLED display with sensor readings
  updateDisplay(distance, ldrValue);
  
  delay(500);  // Update every 500ms
}

// Function to read ultrasonic sensor distance
float readUltrasonicDistance() {
  // Clear the trig pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // Set trig pin HIGH for 10 microseconds
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read the echo pin and calculate distance
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout (~5m)
  if (duration == 0) {
    return -1; // No echo received
  }

  float distance = duration * 0.0343f / 2.0f;  // Convert to cm
  return distance;
}

// Function to control LEDs based on sensor readings
void controlLEDs(float distance, int ldrValue) {
  // Control LEDs based on distance (LED1 and LED2)
  digitalWrite(LED1_PIN, LOW);  // Red LED
  digitalWrite(LED2_PIN, LOW);  // Green LED
  
  if (distance > 0 && distance <= 50) {
    // Object very close - Red LED
    digitalWrite(LED1_PIN, HIGH);
  } else if (distance > 150 && distance <= MAX_DISTANCE) {
    // Object far - Green LED
    digitalWrite(LED2_PIN, HIGH);
  }
  // Medium distance (50-150cm) - no LED, or you can add LED3 here if needed
  
  // Control LED3 based on LDR (light detection)
  static unsigned long lastBlink = 0;
  static bool led3State = false;
  
  if (ldrValue > LDR_THRESHOLD) {
    // Light detected - blink LED3
    if (millis() - lastBlink > 500) {
      led3State = !led3State;
      digitalWrite(LED3_PIN, led3State);
      lastBlink = millis();
    }
  } else {
    // No light detected - turn off LED3
    digitalWrite(LED3_PIN, LOW);
    led3State = false;
  }
}

// Function to update OLED display
void updateDisplay(float distance, int ldrValue) {
  display.clearDisplay();
  display.setTextColor(SH110X_WHITE);

  // Title
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("AERAS Distance");
  display.drawLine(0, 10, 128, 10, SH110X_WHITE);

  // Large distance value in the middle
  display.setTextSize(2);
  display.setCursor(0, 20);
  if (distance > 0) {
    display.print(distance, 1);  // one decimal place
    display.println(" cm");
  } else {
    display.println("N/A");
  }

  // LDR value
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print("LDR:");
  display.print(ldrValue);

  // Status message
  display.setCursor(70, 45);
  if (distance > 0 && distance <= 50) {
    display.println("Close");
  } else if (distance > 50 && distance <= 150) {
    display.println("Mid");
  } else if (distance > 150) {
    display.println("Far");
  } else {
    display.println("Ready");
  }

  display.display();
}

// Function to test LEDs on startup
void testLEDs() {
  // Test LED1 (Red)
  digitalWrite(LED1_PIN, HIGH);
  delay(200);
  digitalWrite(LED1_PIN, LOW);
  
  // Test LED2 (Green)
  digitalWrite(LED2_PIN, HIGH);
  delay(200);
  digitalWrite(LED2_PIN, LOW);
  
  // Test LED3 (Blue/Yellow)
  digitalWrite(LED3_PIN, HIGH);
  delay(200);
  digitalWrite(LED3_PIN, LOW);
  
  Serial.println("LED test complete");
}
