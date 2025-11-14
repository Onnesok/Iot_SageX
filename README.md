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

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
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

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Contact

For inquiries and support:
- **Email**: support@aeras.com
- **Documentation**: See README.md and SETUP.md

## License

This project is open source and available for use.

---

**Built for Senior Citizens and Special Needs Individuals**
