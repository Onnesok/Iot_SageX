# AERAS - Accessible E-Rickshaw Automation System

**Location-Based Ride Request Platform for Senior Citizens and Special Needs Individuals**

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Usage](#usage)
- [Test Cases Coverage](#test-cases-coverage)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)

## Overview

AERAS is an application-less e-rickshaw ride request system designed specifically for:
- **Senior Citizens (≥60 years)**
- **Autistic Individuals**
- **Special Needs Individuals**

The system enables users to request rides by standing on designated location blocks, verified through multi-sensor authentication, with real-time backend coordination of registered rickshaw pullers and reward point distribution.

### Why App-less?
- Removes the cognitive barrier of downloading, installing, and configuring apps.
- Reduces UI/UX complexity for users with diverse accessibility needs.
- Allows dependable offline-first behaviour—rides can be triggered even if phones are out of battery or network range.

### Primary Objectives
- Deliver fail-safe, tamper-resistant ride requests from physical interaction blocks.
- Provide transparent incentives so rickshaw pullers stay responsive and accountable.
- Equip administrators with analytics for planning coverage, rewarding good service, and spotting bottlenecks early.

## Competition Brief Reference (IOTRIX Phase-01)

### Problem Statement
The Bangladesh government wants a digitalized, incentive-based e-rickshaw service for senior citizens, autistic, and special needs individuals. Users must initiate rides without smartphones by standing on CUET campus pile blocks (Pahartoli, Noapara, Raojan). Multi-sensor verification (ultrasonic presence, LDR + laser privilege, button confirmation) triggers backend coordination with registered rickshaw pullers, who earn redeemable points each month.

### Evaluation Criteria Snapshot
| Section | Scope | Marks |
| --- | --- | --- |
| Section A | Hardware implementation & testing (user block + rickshaw unit) | 40 |
| Section B | Software & backend (alert distribution, admin dashboard, DB) | 25 |
| Section C | Integration & system testing (E2E, edge cases) | 15 |
| Section D | Documentation & presentation (circuits, architecture, video) | 10 |
| Section E | Big idea bonus (impact, innovation, feasibility) | +10 |
| **Total** | **Mandatory 90 + Bonus 10 = 100** |  |

Judging weightage: Technical Execution 50%, Innovation & Social Impact 30%, Presentation & Documentation 20%.

### Mandatory Test Coverage (Mapping to Sections)
- **Section A Hardware (Tests 1–7)** – README + `hardware/complete.ino` document ultrasonic timing, laser signature detection, button/buzzer sequencing, LED logic, OLED UI states, Rickshaw web portal, and GPS-based point allocation.
- **Section B Software & Backend (Tests 8–12)** – APIs under `src/app/api/` implement alert distribution, status sync, admin dashboards, point ledger, and database schema.
- **Section C Integration (Tests 13–14)** – End-to-end workflow, multi-user arbitration, puller cancellation, power/network/GPS fallbacks described in Features and Notes sections.
- **Section D Documentation** – Circuit explanations, architecture diagrams (add to `docs/`), and README updates satisfy reporting requirements.
- **Section E Big Idea** – App-less interface rationale, reward economics, and scalability arguments are highlighted in Overview and Notes.

### Submission Requirements & Deadline
- **Deadline:** 15 November, 11:59 PM (UTC+6, Bangladesh Standard Time). Avoid commits after submission.
- **What to submit:**
  1. **Public GitHub Repo** – Include user-side microcontroller firmware, rickshaw-side web app, backend server, admin dashboard, and this README/SETUP docs.
  2. **Hardware Documentation PDF** – Circuit diagrams, wiring, BOM, test evidence.
  3. **Video Demonstration (5–10 min)** – Cover Section A & B test cases, explain hardware/software interactions, host on Google Drive with public viewer access.
  4. **Submission Form** – Provided in classroom; include repo + video links.
- **Compliance:** No fake identities, plagiarism, or late submissions. Judges’ decisions are final.

### Detailed Test Case Mapping

#### Section A – Hardware Implementation (40 marks)
- **Test Case 1 – Ultrasonic Distance Detection:** `hardware/complete.ino` implements 0–10 m detection (scaled to 0–20 cm for demos) with 3–5 s hold timers, ±3 cm tolerance, and edge-case resets (`updateDistanceStability`, `requiredHoldDurationMs`).
- **Test Case 2 – LDR + Laser Verification:** Laser frequency discrimination, hysteresis, and ambient-light rejection live in `detectLaserSignature`, with logging for distance/angle tests.
- **Test Case 3 – Button/Buzzer Confirmation:** `confirmButtonPressed` enforces sequential logic, debounce, duplicate suppression (<2 s), and >5 s timeout handling; buzzer feedback patterns via `playTonePattern`.
- **Test Case 4 – LED Indicators:** `updateIndicators` drives Yellow/Red/Green LEDs for offer, rejection, pickup, and recovery after power loss (state machine resets).
- **Test Case 5 – OLED Display:** `drawInstruction`, `showUltrasonicStatus`, and `showLaserStatus` cover idle, request, ride, and completion contexts with ≤2 s refresh and readability controls.
- **Test Case 6 – Web Application:** `/src/app/rickshaw` UI handles notifications, accept/reject, pickup confirmation, GPS validation, and points dashboard.
- **Test Case 7 – GPS & Points:** Backend uses CUET coordinates (22.4633°N etc.) and the stated formula; point tiers (+10/+8/+5/Pending) are documented under “Point Calculation Formula”.

#### Section B – Software & Backend (25 marks)
- **Test Case 8 – Rider Alert Distribution:** API logic in `/src/app/api/rides` and `/src/lib/database` assigns nearest pullers, handles race conditions, re-alerts on cancel, and enforces 60 s expiry (mirrored by Yellow/Red LEDs).
- **Test Case 9 – Real-time Status Sync:** User block polls `/api/rides/:id`, Rickshaw portal receives SSE/polling updates, and admin dashboard reflects LED/OLED states for acceptance, pickup, drop-off.
- **Test Case 10 – Admin Monitoring:** `/src/app/admin` provides live stats, ride filtering, and point adjustments; analytics cover most requested destinations, wait times, and leaderboards.
- **Test Case 11 – Point Reward Management:** Points ledger and redemption workflows reside in backend services; fraud detection hooks flag GPS anomalies and pending reviews.
- **Test Case 12 – Database Design:** Prisma schema defines Users, Pullers, Rides, Locations, and PointsHistory with FK constraints, concurrency-safe writes, and backup recommendations (see `prisma/schema.prisma`).

#### Section C – Integration & Testing (15 marks)
- **Test Case 13 – End-to-End Journey:** README’s “Usage” + firmware states describe the 12-step CUET flow from presence detection to GPS-verified completion with automatic reset and logging.
- **Test Case 14 – Edge Cases:** System handles multi-user arbitration (block latching), puller cancellation (re-alert), power/GPS/network failures (state persistence, manual review), and offline caching.

#### Section D – Documentation & Presentation (10 marks)
- **Circuit Diagrams & Software Architecture:** Provide in accompanying PDF (`docs/aeras-hardware.pdf`) plus README architecture diagrams and API references.
- **Video Demonstration:** Record 5–10 minute walkthrough covering all Section A & B tests, installation, and narration; host via Google Drive (viewer access).

#### Section E – Big Idea Bonus (10 marks)
- **Socio-economic impact:** Address mobility challenges, reward economics, nationwide scalability, and adoption barriers within README “Overview” & “Notes”.
- **Innovation & Uniqueness:** App-less game-matrix interface, multi-sensor authentication, and incentive loops are articulated under “Why App-less?” and “Primary Objectives”.
- **System Integration & Feasibility:** “System Architecture” and “Key Features Implementation” detail data flow, hardware/software communication, and concurrency handling.

### Database Schema Overview
| Collection | Key Fields | Relationships / Notes |
| --- | --- | --- |
| `admins` | `username`, `password`, `name`, `email`, timestamps | Credentials for dashboard access. |
| `locations` | `name`, `latitude`, `longitude`, `blockId` | Referenced twice by `rides` (pickup & destination). |
| `users` | `name`, `age`, `userType`, `privilegeVerified` | One-to-many with `rides`. |
| `pullers` | `name`, `phone`, `currentLatitude`, `currentLongitude`, `isOnline`, `points`, `totalRides` | Linked to `rides` (assigned puller) and `points_history`. |
| `rides` | `userId`, `pullerId`, `pickupLocationId`, `destinationLocationId`, `status`, `pointsStatus`, GPS logs, timestamps | Core workflow entity; stores distance penalties and award status. |
| `points_history` | `pullerId`, `rideId`, `points`, `type`, `description` | Ledger for earned/redeemed/expired/adjusted points. |

```1:112:prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model Admin {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  username  String   @unique
  password  String
  name      String
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admins")
}

model Location {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  latitude  Float
  longitude Float
  blockId   String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  pickupRides        Ride[] @relation("PickupLocation")
  destinationRides   Ride[] @relation("DestinationLocation")

  @@map("locations")
}

model User {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  name              String
  age               Int
  userType          String   // 'senior' | 'special_needs'
  privilegeVerified Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  rides             Ride[]

  @@map("users")
}

model Puller {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  phone           String
  currentLatitude Float?
  currentLongitude Float?
  isOnline        Boolean  @default(false)
  points          Float    @default(0)
  totalRides      Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  rides           Ride[]
  pointsHistory   PointsHistory[]

  @@map("pullers")
}

model Ride {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  userId              String   @db.ObjectId
  pullerId            String?  @db.ObjectId
  pickupLocationId    String   @db.ObjectId
  destinationLocationId String @db.ObjectId
  status              String   @default("pending") // 'pending' | 'accepted' | 'pickup_confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
  pointsAwarded       Float?
  pointsStatus        String   @default("pending") // 'pending' | 'rewarded' | 'under_review'
  pickupLatitude      Float?
  pickupLongitude     Float?
  dropoffLatitude     Float?
  dropoffLongitude    Float?
  distanceFromBlock   Float?
  createdAt           DateTime @default(now())
  acceptedAt          DateTime?
  pickupConfirmedAt   DateTime?
  completedAt         DateTime?
  updatedAt           DateTime @updatedAt
  
  user                User     @relation(fields: [userId], references: [id])
  puller              Puller?  @relation(fields: [pullerId], references: [id])
  pickupLocation      Location @relation("PickupLocation", fields: [pickupLocationId], references: [id])
  destinationLocation Location @relation("DestinationLocation", fields: [destinationLocationId], references: [id])

  @@map("rides")
}

model PointsHistory {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  pullerId    String   @db.ObjectId
  rideId      String?  @db.ObjectId
  points      Float
  type        String   // 'earned' | 'redeemed' | 'expired' | 'adjusted'
  description String
  createdAt   DateTime @default(now())
  
  puller      Puller   @relation(fields: [pullerId], references: [id])

  @@map("points_history")
}
```
*(Full Prisma schema with field types, defaults, ObjectId mappings, and relations.)*

## System Architecture

### User-Side (App-less Interface)
- Physical Location Blocks (destination markers in Pile System)
- Ultrasonic Sensor (distance detection ≤10m, time ≥3sec)
- User Laser Device (privilege verification)
- Confirmation Button/Buzzer
- OLED Display (user authentication and route information)
- LED Indicators (Yellow: offer incoming, Red: rejected, Green: accepted)

### Rickshaw-Side
- OLED Display (ride details, navigation)
- GPS Module (drop-off verification)
- Web UI (accept/reject, track rides)
- Backend Communication Module (WiFi/GSM)

### Backend System
- Rider Alert Distribution System
- Real-time Status Synchronization
- Point Reward Management
- Admin Dashboard & Analytics
- WebSocket/Polling transport abstraction that falls back gracefully when connectivity is poor

### End-to-End Data Flow
1. **Presence Detection** – Ultrasonic sensor detects a person within 10m for ≥3s to reduce accidental triggers.
2. **Privilege Validation** – LDR and laser handshake confirms the user has a registered privilege token.
3. **Intent Confirmation** – Physical button press (with buzzer feedback) sends a ride request packet to the backend.
4. **Dispatch Logic** – Backend scores nearby rickshaw pullers (availability + distance + past performance) and broadcasts offers.
5. **Ride Lifecycle** – Puller accepts, arrives, confirms pickup, drives to destination, and completes via GPS verification.
6. **Post-Ride Accounting** – Reward points are logged, disputes flagged, and dashboards refreshed in real time.

### Hardware → Cloud Connectivity
- ESP32/ESP8266 pushes MQTT/HTTP events over WiFi or GSM fallback.
- Web backend publishes events to Rickshaw Portal via SSE/WebSocket (configurable).
- GPS coordinates are normalized on the server before calculating distances.

### Security Considerations
- Block IDs and puller IDs are signed before transmission.
- Simple challenge-response between block laser device and backend prevents replay attacks.
- Admin endpoints require JWT-based authentication with role-based guards.

### Architecture Diagrams
![System Architecture Diagram](./public/architecture.png)
![Detailed Data Flow Diagram](./public/architecture%202.png)

## Features

### Core Functionality
- **Location-Based Ride Requests** - Users stand on designated blocks to request rides
- **Multi-Sensor Authentication** - Ultrasonic + LDR + Laser verification
- **Real-time Coordination** - Backend alerts nearest pullers
- **GPS Verification** - Automatic drop-off location verification
- **Point Reward System** - Incentive-based points for pullers
- **Admin Dashboard** - Complete system monitoring and management

### Location Blocks (CUET Campus Demo)
- **CUET Campus**: 22.4633°N, 91.9714°E
- **Pahartoli**: 22.4725°N, 91.9845°E
- **Noapara**: 22.4580°N, 91.9920°E
- **Raojan**: 22.4520°N, 91.9650°E

### Hardware Components (Demo Rig)
| Module | Purpose | Notes |
| --- | --- | --- |
| Ultrasonic HC-SR04 | Detect passenger presence | Debounced by averaging 5 readings |
| LDR + Laser Pair | Authenticate registered users | Laser is embedded in wearable token |
| ESP32 DevKit | Main controller running `hardware/complete.ino` | Handles WiFi + sensor fusion |
| OLED SSD1306 | Feedback for both user and puller blocks | Displays authentication state and ride info |
| Buzzer + Push Button | Confirmation feedback | Button doubles as cancel when long-pressed |
| GPS NEO-6M | Mounted on rickshaw | Provides continuous position updates |
| LED Strip (RGB) | Status indicator | Color-coded to match UI states |

### Firmware Overview (`hardware/complete.ino`)
- **Hardware Abstraction** – Pin maps for ultrasonic, LDR, block plates, RGB LEDs, buzzer, and I2C OLED are documented at the top of the file; match wiring exactly to avoid runtime pin remapping.
- **Network & Backend Config** – Update `WIFI_SSID`, `WIFI_PASSWORD`, `API_BASE_URL`, and the seeded `REGISTERED_USER_ID`/location IDs before flashing. The firmware expects the Next.js API running at `http://<backend>:3000/api`.
- **Scaled Demo Distances** – Real 0–10 m presence detection is scaled down to 0–20 cm for bench demos (`REAL_TO_DEMO_SCALE_CM_PER_M = 2.0f`). Adjust the constant if your rig uses a different scale.
- **Laser Verification** – The LDR logic combines raw ADC deltas with a percent-based smoothing filter (`LDR_PERCENT_SMOOTH_ALPHA = 0.06`) to tolerate ambient light changes.
- **Ride Dispatch** – Successful confirmation posts to `/api/rides` via HTTPClient and then polls `/api/rides/:id` every 2 s until completion or timeout.

### State Machine Reference
| State | Trigger | OLED Copy / LED Pattern | Notes |
| --- | --- | --- | --- |
| `STATE_IDLE` | Default | “Stand on a block” | Waiting for presence within 10 m (≤20 cm demo). |
| `STATE_PRESENCE_TRACKING` | Stable ultrasonic readings | “Hold for 3 sec” progress bar | Requires 3–5 s hold depending on range (`requiredHoldDurationMs`). |
| `STATE_WAITING_BLOCK` | Presence confirmed | “Step on destination block” | `BLOCK_SELECT_HOLD_MS` ensures 0.6 s contact on metal plate. |
| `STATE_WAITING_LASER` | Block latched | “Aim light >8%” | LDR percent and hold timer shown live on OLED. |
| `STATE_WAITING_CONFIRM` | Laser verified | “Press confirm button” | Button hold >5 s cancels flow; stepping off resets. |
| `STATE_DISPATCHING` | Button tapped | “Sending request…” | HTTP POST to backend runs synchronously. |
| `STATE_WAITING_PULLER` | Ride created | Yellow LED blinking | Polls `/api/rides/:id` until accept or timeout. |
| `STATE_RIDE_ACCEPTED` | Backend status `accepted` | Yellow LED solid | Puller en route. |
| `STATE_PICKUP_CONFIRMED` | Status `pickup_confirmed`/`in_progress` | Green LED solid | Ride active. |
| `STATE_RIDE_COMPLETED` | Status `completed` | Green LED solid, auto reset after 8 s | Points logged on backend. |
| `STATE_REJECTED_OR_ERROR` | Timeout, rejection, HTTP error | Red LED solid, auto reset after 8 s | OLED shows cause message. |

### Firmware Workflow Snapshot
```16:60:hardware/complete.ino
void loop() {
  ensureWiFi();
  float distanceCm = readUltrasonicDistanceCm();
  int activeBlock = detectActiveBlock();
  int ldrReading = analogRead(LDR_PIN);
  bool distanceStable = updateDistanceStability(distanceCm);
  updateStateMachine(distanceCm, distanceStable, activeBlock, ldrReading);
  updateIndicators();
  delay(35);
}
```
*(See the file header comment in `hardware/complete.ino` for calibration tables, state timing constants, and pin layouts.)*

### Firmware Configuration & Flashing
1. Set Wi-Fi and backend constants near lines 47–55 of `hardware/complete.ino`.
2. Confirm the seeded database contains the IDs referenced by `REGISTERED_USER_ID`, `PICKUP_LOCATION_ID`, and `DESTINATION_BLOCKS`.
3. Install required Arduino libraries: `Adafruit_SH110X`, `Adafruit_GFX`, `WiFi`, `HTTPClient`, `ArduinoJson`.
4. Select **ESP32-C3 Dev Module** in the Arduino IDE (or `idf.py` equivalent), set baud to 115200, and flash.
5. Monitor serial output; the boot log prints ultrasonic calibration values, Wi-Fi IP, and ride status transitions for debugging.

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/Onnesok/Iot_SageX.git
cd iot-matrix
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Environment Variables
Create a `.env` or `.env.local` file in the root directory:
```env
DATABASE_URL="mongodb://localhost:27017/aeras"
```

For MongoDB Atlas (cloud):
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/aeras?retryWrites=true&w=majority"
```

For local MongoDB:
```env
DATABASE_URL="mongodb://localhost:27017/aeras"
```

### Database Setup
1. **Generate Prisma Client**:
```bash
npx prisma generate
```

2. **Push Database Schema**:
```bash
npx prisma db push
```

3. **Seed Database** (creates default admin and sample data):
```bash
npm run db:seed
```

**Default Admin Credentials** (after seeding):
- Username: `admin`
- Password: `admin123`

**Important**: Change the default password in production!

## API Documentation

### Rides API

#### Create Ride Request
```http
POST /api/rides
Content-Type: application/json

{
  "userId": "user_123",
  "pickupLocationId": "loc_1",
  "destinationLocationId": "loc_2"
}
```

#### Get Active Requests
```http
GET /api/rides?type=active
```

#### Get All Rides
```http
GET /api/rides
```

#### Get Ride by ID
```http
GET /api/rides/[id]
```

#### Update Ride Status
```http
PATCH /api/rides/[id]
Content-Type: application/json

{
  "action": "accept|reject|confirm_pickup|complete|cancel",
  "pullerId": "puller_123",
  "latitude": 22.4633,
  "longitude": 91.9714
}
```

### Pullers API

#### Get All Pullers
```http
GET /api/pullers
GET /api/pullers?online=true
```

#### Create Puller
```http
POST /api/pullers
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+8801234567890"
}
```

#### Get Puller by ID
```http
GET /api/pullers/[id]
```

#### Update Puller Status
```http
PATCH /api/pullers/[id]
Content-Type: application/json

{
  "isOnline": true,
  "latitude": 22.4633,
  "longitude": 91.9714
}
```

#### Get Nearby Pullers
```http
GET /api/pullers/[id]/nearby?latitude=22.4633&longitude=91.9714&rideId=ride_123
```

### Statistics API

#### Get System Statistics
```http
GET /api/stats
```

Returns:
- Overview (total users, pullers, rides, etc.)
- Analytics (most requested destinations, average wait time, leaderboard)
- Pending reviews count

### Locations API

#### Get All Locations
```http
GET /api/locations
```

### Seed API

#### Initialize Demo Data
```http
POST /api/seed
```

Populates the database with sample users, pullers, and completed rides for testing purposes.

## 💻 Usage

### For Rickshaw Pullers

1. **Access Rickshaw Portal**
   - Navigate to `/rickshaw`
   - Enter your Puller ID to login
   - Set your status to "Online"

2. **Accept Ride Requests**
   - View incoming ride requests
   - Click "Accept" to take a ride
   - Navigate to pickup location

3. **Complete Rides**
   - Confirm pickup when you arrive
   - Drive to destination
   - Complete ride (GPS automatically verifies location)
   - Points are awarded based on drop-off accuracy

4. **View Points**
   - Check your points balance
   - View points history
   - Track your earnings

### For Administrators

1. **Access Admin Dashboard**
   - Navigate to `/admin`
   - View real-time system statistics

2. **Monitor System**
   - Overview tab: System health and key metrics
   - Rides tab: View all rides, filter by status
   - Analytics tab: Performance metrics and leaderboard

3. **Manage Rides**
   - Review pending point allocations
   - Adjust points for disputed rides
   - Monitor system performance

## Test Cases Coverage

### Section A: Hardware Implementation (40 marks)
- **Test Case 1**: Ultrasonic Distance Detection
- **Test Case 2**: LDR + Laser Privilege Verification
- **Test Case 3**: Button/Buzzer Confirmation System
- **Test Case 4**: LED Status Indicators System
- **Test Case 5**: OLED Display Information System
- **Test Case 6**: Web Application (Rickshaw Portal)
- **Test Case 7**: GPS Location & Point Allocation

### Section B: Software & Backend (25 marks)
- **Test Case 8**: Rider Community Alert Distribution
- **Test Case 9**: Real-time Status Synchronization
- **Test Case 10**: Admin Monitoring
- **Test Case 11**: Point Reward Management System
- **Test Case 12**: Database Design

### Section C: Integration & Testing (15 marks)
- **Test Case 13**: End-to-End User Journey
- **Test Case 14**: Edge Cases & Failure Scenarios

## Technology Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **In-Memory Database** - For demo (can be replaced with PostgreSQL/MongoDB)

### Key Libraries
- `framer-motion` - Smooth animations
- `next` - Full-stack React framework

## Project Structure

```
iot-matrix/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── rides/          # Ride management API
│   │   │   ├── pullers/        # Puller management API
│   │   │   ├── stats/          # Statistics API
│   │   │   └── locations/      # Locations API
│   │   ├── rickshaw/           # Rickshaw Portal UI
│   │   ├── admin/              # Admin Dashboard UI
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── lib/
│   │   └── database.ts         # Database utilities
│   └── components/             # Reusable components
├── public/                     # Static assets
├── package.json
├── README.md
└── tsconfig.json
```

## Point Calculation Formula

```
Base Points = 10
Distance Penalty = (Actual Distance from Block / 10m)
Final Points = Base Points - Distance Penalty (minimum 0)
```

**Point Allocation:**
- Drop at exact block location: **+10 points** (Full reward)
- Drop within 50m of block: **+8 points** (Partial reward)
- Drop 51-100m from block: **+5 points** (Reduced reward)
- Drop >100m from block: **PENDING** (Admin review required)

## Key Features Implementation

### Real-time Updates
- Polling every 3-5 seconds for ride requests
- Automatic status synchronization
- Live GPS location updates

### GPS Verification
- Automatic distance calculation using Haversine formula
- Point allocation based on drop-off accuracy
- Pending status for manual review when needed

### Admin Features
- Real-time dashboard with system statistics
- Ride management and filtering
- Analytics and leaderboard
- Point adjustment capabilities

## Notes

### Current Implementation
- Uses in-memory database for demo purposes
- For production, replace with PostgreSQL/MongoDB
- GPS location uses browser Geolocation API
- All test cases are covered in the backend logic

### Hardware Integration
The web application is ready to integrate with:
- ESP32/Arduino for user-side blocks
- GPS modules for location tracking
- Sensor arrays (ultrasonic, LDR, laser)
- LED indicators and OLED displays

### Troubleshooting Tips
- **Ride requests not appearing** – Ensure the block’s ESP32 is registered and reporting healthy heartbeat logs via `/api/stats`.
- **GPS accuracy drift** – Calibrate NEO-6M with a clear sky view and verify antenna placement; consider SBAS-enabled modules for production.
- **Duplicate ride alerts** – Check that block firmware’s debounce interval (`REQUEST_COOLDOWN_MS`) matches backend expectation (default 10s).
- **Admin dashboard stale data** – Confirm polling interval hasn’t been disabled in `.env` (`NEXT_PUBLIC_POLL_INTERVAL_MS`).

## Development Workflow
- Use `npm run lint` and `npm run test` (if configured) before submitting PRs.
- Prefer small, focused commits; link them to GitHub issues where possible.
- For hardware changes, document wiring diagrams under `hardware/docs/` and attach serial logs in PR description.

## Roadmap
- Expand blocks to run over LoRaWAN for rural deployments.
- Add multilingual text-to-speech prompts on user blocks.
- Introduce machine learning–based demand forecasting for admin dashboards.
- Pilot integration with digital payment wallets for cashless incentives.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available for use.

---

**Built for Senior Citizens and Special Needs Individuals**
