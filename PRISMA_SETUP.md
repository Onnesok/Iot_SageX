# Prisma Setup Guide - MongoDB

## Initial Setup

1. **Install MongoDB** (if using local):
   - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Create `.env` file** in the root directory:
```env
# For local MongoDB
DATABASE_URL="mongodb://localhost:27017/aeras"

# For MongoDB Atlas (cloud)
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/aeras?retryWrites=true&w=majority"
```

3. **Generate Prisma Client**:
```bash
npx prisma generate
```

4. **Push Database Schema**:
```bash
npx prisma db push
```

5. **Seed Database**:
```bash
npm run db:seed
```

## Default Admin Credentials

After seeding, you can login with:
- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change the default password in production!

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio to view/edit data

## Environment Variables

Make sure your `.env` or `.env.local` file contains:
```
# For local MongoDB
DATABASE_URL="mongodb://localhost:27017/aeras"

# For MongoDB Atlas (cloud)
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/aeras?retryWrites=true&w=majority"
```

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use: `DATABASE_URL="mongodb://localhost:27017/aeras"`

### Option 2: MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Use: `DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/aeras?retryWrites=true&w=majority"`

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running (if using local)
- Check connection string format
- Verify network access (for Atlas)
- Check firewall settings

### Prisma Client Issues
- Run `npx prisma generate` after schema changes
- Clear node_modules and reinstall if needed
