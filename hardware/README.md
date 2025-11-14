# AERAS Hardware Integration Guide

This directory contains Arduino/ESP32 code for integrating hardware components with the AERAS backend system.

## Hardware Components

### User-Side Location Block

**Required Components:**
- ESP32 or Arduino with WiFi capability
- HC-SR04 Ultrasonic Sensor
- LDR (Light Dependent Resistor) Sensor
- Push Button
- 3x LEDs (Yellow, Red, Green)
- OLED Display (SSD1306, 128x64)
- Buzzer (optional)
- Resistors and wiring

**Pin Configuration:**
```
Ultrasonic Sensor:
  - Trig: GPIO 5
  - Echo: GPIO 18

LDR Sensor:
  - Analog: GPIO 34 (ADC)

Button:
  - GPIO 19 (with pull-up)

LEDs:
  - Yellow: GPIO 21
  - Red: GPIO 22
  - Green: GPIO 23

OLED Display (I2C):
  - SDA: GPIO 21
  - SCL: GPIO 22

Buzzer:
  - GPIO 25
```

**Setup Instructions:**
1. Install required libraries:
   - WiFi (ESP32 built-in)
   - HTTPClient (ESP32 built-in)
   - ArduinoJson
   - Adafruit_SSD1306
   - Adafruit_GFX

2. Update configuration in `user-side-block.ino`:
   - WiFi SSID and password
   - Backend URL
   - Block ID and Location ID for each block

3. Upload code to ESP32

4. Test each component individually before full integration

### Rickshaw-Side System

**Required Components:**
- ESP32 with WiFi
- GPS Module (NEO-6M or similar)
- OLED Display (SSD1306, 128x64)

**Pin Configuration:**
```
GPS Module (Software Serial):
  - RX: GPIO 16
  - TX: GPIO 17

OLED Display (I2C):
  - SDA: GPIO 21
  - SCL: GPIO 22
```

**Setup Instructions:**
1. Install required libraries (same as user-side)

2. Update configuration in `rickshaw-side.ino`:
   - WiFi SSID and password
   - Backend URL
   - Puller ID

3. Upload code to ESP32

4. Ensure GPS module has clear view of sky for signal

## API Integration

### User-Side API Calls

**Create Ride Request:**
```http
POST /api/rides
Content-Type: application/json

{
  "userId": "user_123",
  "pickupLocationId": "loc_1",
  "destinationLocationId": "loc_2"
}
```

**Check Ride Status:**
```http
GET /api/rides/{rideId}
```

### Rickshaw-Side API Calls

**Update Puller Location:**
```http
PATCH /api/pullers/{pullerId}
Content-Type: application/json

{
  "latitude": 22.4633,
  "longitude": 91.9714
}
```

**Set Online Status:**
```http
PATCH /api/pullers/{pullerId}
Content-Type: application/json

{
  "isOnline": true
}
```

**Get Active Rides:**
```http
GET /api/rides?pullerId={pullerId}
```

## Testing Checklist

### User-Side Testing

- [ ] Ultrasonic sensor detects presence (0-10m range)
- [ ] 3-second continuous presence triggers next state
- [ ] LDR detects laser frequency correctly
- [ ] Button press sends ride request
- [ ] LEDs show correct status (Yellow/Red/Green)
- [ ] OLED displays information correctly
- [ ] Buzzer provides audio feedback
- [ ] WiFi connection stable
- [ ] API communication working

### Rickshaw-Side Testing

- [ ] GPS module receives signal
- [ ] Location updates sent to backend
- [ ] Online status updates correctly
- [ ] Active ride information displayed on OLED
- [ ] WiFi connection stable

## Troubleshooting

### Common Issues

1. **WiFi Connection Failed**
   - Check SSID and password
   - Ensure WiFi signal strength is adequate
   - Check if ESP32 supports 2.4GHz WiFi

2. **Ultrasonic Sensor Not Working**
   - Check wiring (Trig and Echo)
   - Ensure sensor has clear path
   - Test with serial monitor

3. **LDR Not Detecting Laser**
   - Adjust threshold value
   - Check LDR wiring
   - Ensure laser is directed at LDR

4. **OLED Display Blank**
   - Check I2C address (usually 0x3C)
   - Verify SDA/SCL connections
   - Check power supply

5. **GPS Not Getting Signal**
   - Ensure GPS module has clear view of sky
   - Wait 2-3 minutes for first fix
   - Check baud rate (usually 9600)

## Production Considerations

1. **Power Supply**
   - Use stable 5V power supply for ESP32
   - Consider battery backup for location blocks
   - Add power management for rickshaw system

2. **Weather Protection**
   - Enclose location blocks in weatherproof housing
   - Protect sensors from direct sunlight/rain

3. **Security**
   - Use HTTPS for API calls in production
   - Implement authentication tokens
   - Encrypt sensitive data

4. **Reliability**
   - Add error handling and retry logic
   - Implement watchdog timers
   - Add status monitoring

## Support

For hardware integration issues, refer to:
- ESP32 Documentation: https://docs.espressif.com/
- ArduinoJson Library: https://arduinojson.org/
- Adafruit SSD1306: https://learn.adafruit.com/adafruit-ssd1306-oled-displays

Contact: eteteleverse@gmail.com

