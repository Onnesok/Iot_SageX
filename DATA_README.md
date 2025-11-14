# AERAS System - Database Credentials & Reference Data

This document contains all usernames, passwords, IDs, and reference data for the AERAS (Accessible E-Rickshaw Automation System) database.

## ⚠️ Security Warning

**IMPORTANT**: This file contains sensitive credentials. Do NOT commit this file to version control or share it publicly. Keep it secure and change default passwords in production!

---

## 🔐 Admin Credentials

### Default Admin Account

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Name** | System Administrator |
| **Email** | admin@aeras.com |

**Login URL**: `http://localhost:3000/admin`

**⚠️ Change this password immediately in production!**

---

## 🚲 Puller IDs (Rickshaw Portal Login)

Pullers can log in to the Rickshaw Portal using either:
- **Puller ID** (MongoDB ObjectId) - 24-character hex string
- **Phone Number** - The phone number associated with their account

No password is required.

### Puller 1: Karim Uddin
- **Puller ID**: `69162c8632597e9a6aee86e3`
- **Name**: Karim Uddin
- **Phone**: +8801712345678
- **Points**: 8.5
- **Total Rides**: 1
- **Status**: Online

### Puller 2: Rashid Ali
- **Puller ID**: `69162c8632597e9a6aee86e4`
- **Name**: Rashid Ali
- **Phone**: +8801723456789
- **Points**: 9.5
- **Total Rides**: 1
- **Status**: Online

### Puller 3: Hasan Mia
- **Puller ID**: `69162c8632597e9a6aee86e5`
- **Name**: Hasan Mia
- **Phone**: +8801734567890
- **Points**: 0
- **Total Rides**: 0
- **Status**: Offline

**Login URL**: `http://localhost:3000/rickshaw`

**Login Options**:
- Enter the **Puller ID** (e.g., `69162c8632597e9a6aee86e3`)
- OR enter the **Phone Number** (e.g., `+8801712345678` or `8801712345678`)

The system will automatically detect whether you entered an ObjectId or phone number and log you in accordingly.

---

## 👥 Users (Reference Data)

These are sample users in the system. Users don't have login credentials - they are data entries for ride requests.

### User 1: Abdul Rahman
- **User ID**: `69162c8532597e9a6aee86e0`
- **Name**: Abdul Rahman
- **Age**: 65
- **Type**: senior
- **Privilege Verified**: ✅ Yes

### User 2: Fatima Begum
- **User ID**: `69162c8532597e9a6aee86e1`
- **Name**: Fatima Begum
- **Age**: 72
- **Type**: senior
- **Privilege Verified**: ✅ Yes

### User 3: Ahmed Hassan
- **User ID**: `69162c8632597e9a6aee86e2`
- **Name**: Ahmed Hassan
- **Age**: 25
- **Type**: special_needs
- **Privilege Verified**: ✅ Yes

---

## 📍 Locations

### Location 1: CUET Campus
- **Location ID**: `69162c8432597e9a6aee86dc`
- **Name**: CUET Campus
- **Block ID**: `block_cuet`
- **Coordinates**: 22.4633°N, 91.9714°E

### Location 2: Pahartoli
- **Location ID**: `69162c8432597e9a6aee86dd`
- **Name**: Pahartoli
- **Block ID**: `block_pahartoli`
- **Coordinates**: 22.4725°N, 91.9845°E

### Location 3: Noapara
- **Location ID**: `69162c8432597e9a6aee86de`
- **Name**: Noapara
- **Block ID**: `block_noapara`
- **Coordinates**: 22.458°N, 91.992°E

### Location 4: Raojan
- **Location ID**: `69162c8532597e9a6aee86df`
- **Name**: Raojan
- **Block ID**: `block_raojan`
- **Coordinates**: 22.452°N, 91.965°E

---

## 🔄 How to Get Updated IDs

If you need to retrieve the latest IDs after reseeding the database, run:

```bash
npx tsx scripts/get-credentials.ts
```

Or use Prisma Studio to view all data:

```bash
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit all database records.

---

## 📝 Quick Reference

### Admin Dashboard
- **URL**: `http://localhost:3000/admin`
- **Username**: `admin`
- **Password**: `admin123`

### Rickshaw Portal
- **URL**: `http://localhost:3000/rickshaw`
- **Login**: Use Puller ID (see above)

### API Endpoints
- **Base URL**: `http://localhost:3000/api`
- **Locations**: `GET /api/locations`
- **Pullers**: `GET /api/pullers`
- **Rides**: `GET /api/rides`
- **Stats**: `GET /api/stats`

---

## 🗄️ Database Information

- **Database Type**: MongoDB
- **Database Name**: `aeras`
- **Provider**: MongoDB Atlas
- **Connection**: Configured via `DATABASE_URL` in `.env` file

---

## 🔧 Maintenance Commands

### Reseed Database
```bash
npm run db:seed
```

### View Database (Prisma Studio)
```bash
npm run db:studio
```

### Push Schema Changes
```bash
npm run db:push
```

---

## 📧 Contact

For support or questions:
- **Email**: ratul.hasan@g.bracu.ac.bd

---

**Last Updated**: Generated automatically from database
**Note**: IDs may change if database is reseeded. Always check the latest values using Prisma Studio or the get-credentials script.

