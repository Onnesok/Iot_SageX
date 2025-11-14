# AERAS - Setup and Installation Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (for cloning repository)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Landing Page: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Rickshaw Portal: http://localhost:3000/rickshaw

4. **Seed Demo Data (Optional)**
   ```bash
   # The database auto-seeds on server start
   # Or manually call: POST /api/seed
   ```

## Project Structure

```
iot-matrix/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── admin/                # Admin dashboard
│   │   ├── rickshaw/             # Rickshaw portal
│   │   └── api/                  # Backend API routes
│   ├── lib/
│   │   ├── database.ts          # Database utilities
│   │   └── seed.ts              # Demo data seeding
│   └── components/              # Reusable components
├── hardware/                     # Arduino/ESP32 code
│   ├── user-side-block.ino      # User location block code
│   ├── rickshaw-side.ino        # Rickshaw system code
│   └── README.md                # Hardware integration guide
└── README.md                     # Main documentation
```

## Features Overview

### Completed Features

1. **Landing Page**
   - System overview and architecture
   - Feature showcase
   - Location information
   - Navigation to portals

2. **Admin Dashboard**
   - Real-time system statistics
   - Ride management and filtering
   - Point adjustment functionality
   - Analytics and leaderboard
   - Most requested destinations

3. **Rickshaw Portal**
   - Puller login system
   - Real-time ride request notifications
   - Accept/reject ride functionality
   - GPS location tracking
   - Pickup and drop-off confirmation
   - Points history and balance

4. **Backend API**
   - Complete REST API for all operations
   - Ride management (create, update, status)
   - Puller management (location, status)
   - Statistics and analytics
   - Point reward system
   - GPS verification

5. **Hardware Integration**
   - Arduino/ESP32 code templates
   - User-side location block code
   - Rickshaw-side system code
   - Complete hardware documentation

## API Endpoints

### Rides
- `GET /api/rides` - Get all rides
- `GET /api/rides?type=active` - Get active requests
- `POST /api/rides` - Create ride request
- `GET /api/rides/[id]` - Get specific ride
- `PATCH /api/rides/[id]` - Update ride (accept, reject, complete, adjust_points)

### Pullers
- `GET /api/pullers` - Get all pullers
- `GET /api/pullers?online=true` - Get online pullers
- `POST /api/pullers` - Create puller
- `GET /api/pullers/[id]` - Get specific puller
- `PATCH /api/pullers/[id]` - Update puller (location, status)
- `GET /api/pullers/[id]/nearby` - Get nearby pullers

### Locations
- `GET /api/locations` - Get all location blocks

### Statistics
- `GET /api/stats` - Get system statistics

### Seed
- `POST /api/seed` - Seed demo data

## Location Blocks (CUET Campus)

1. **CUET Campus**: 22.4633°N, 91.9714°E
2. **Pahartoli**: 22.4725°N, 91.9845°E
3. **Noapara**: 22.4580°N, 91.9920°E
4. **Raojan**: 22.4520°N, 91.9650°E

## Point System

**Formula:**
```
Base Points = 10
Distance Penalty = (Distance from Block / 10m)
Final Points = Base Points - Distance Penalty (minimum 0)
```

**Point Allocation:**
- Exact location (0m): **+10 points**
- Within 50m: **+8 points** (partial reward)
- 51-100m: **+5 points** (reduced reward)
- >100m: **PENDING** (admin review required)

## Testing the System

### 1. Test Admin Dashboard
1. Navigate to http://localhost:3000/admin
2. View system statistics
3. Check ride history
4. Test point adjustment on rides with "under_review" status

### 2. Test Rickshaw Portal
1. Navigate to http://localhost:3000/rickshaw
2. Login with a puller ID (e.g., from seeded data)
3. View active ride requests
4. Accept a ride
5. Confirm pickup
6. Complete ride with GPS coordinates

### 3. Test API Endpoints
Use tools like Postman or curl to test API endpoints:
```bash
# Create a ride request
curl -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "pickupLocationId": "loc_1",
    "destinationLocationId": "loc_2"
  }'

# Get statistics
curl http://localhost:3000/api/stats
```

## Hardware Integration

See `hardware/README.md` for complete hardware setup instructions.

### Quick Hardware Setup:
1. Upload `user-side-block.ino` to ESP32 for location blocks
2. Upload `rickshaw-side.ino` to ESP32 for rickshaw system
3. Configure WiFi credentials in code
4. Update backend URL to match your server
5. Test each component individually

## Production Deployment

### Environment Variables
Create `.env` or `.env.local`:
```env
# For local MongoDB
DATABASE_URL="mongodb://localhost:27017/aeras"

# For MongoDB Atlas (cloud)
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/aeras?retryWrites=true&w=majority"

# Optional
# NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### Build for Production
```bash
npm run build
npm start
```

### Database Setup
The project uses MongoDB with Prisma ORM:

1. **Install MongoDB** (if using local):
   - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Set up database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

3. **For production**: Use MongoDB Atlas or your MongoDB instance

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change port: `PORT=3001 npm run dev`

2. **API Errors**
   - Check browser console for errors
   - Verify API routes are accessible
   - Check database initialization

3. **Hardware Connection Issues**
   - Verify WiFi credentials
   - Check backend URL is accessible
   - Test API endpoints manually

## Support

For issues or questions:
- **Email**: support@aeras.com
- **Documentation**: See README.md for detailed information

---

**Built for Senior Citizens and Special Needs Individuals**

