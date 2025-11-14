import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin if not exists
  const existingAdmin = await prisma.admin.findFirst({
    where: { username: 'admin' }
  });
  
  let admin;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        email: 'admin@aeras.com'
      }
    });
    console.log('Created admin:', admin.username);
  } else {
    admin = existingAdmin;
    console.log('Admin already exists:', admin.username);
  }

  // Create locations (delete existing and recreate for clean seed)
  await prisma.location.deleteMany({});
  
  const locations = [
    {
      name: 'CUET Campus',
      latitude: 22.4633,
      longitude: 91.9714,
      blockId: 'block_cuet'
    },
    {
      name: 'Pahartoli',
      latitude: 22.4725,
      longitude: 91.9845,
      blockId: 'block_pahartoli'
    },
    {
      name: 'Noapara',
      latitude: 22.4580,
      longitude: 91.9920,
      blockId: 'block_noapara'
    },
    {
      name: 'Raojan',
      latitude: 22.4520,
      longitude: 91.9650,
      blockId: 'block_raojan'
    }
  ];

  for (const loc of locations) {
    await prisma.location.create({
      data: loc
    });
  }
  console.log('Created locations');

  // Clear existing data for clean seed
  await prisma.pointsHistory.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.puller.deleteMany({});

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      name: 'Abdul Rahman',
      age: 65,
      userType: 'senior',
      privilegeVerified: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Fatima Begum',
      age: 72,
      userType: 'senior',
      privilegeVerified: true
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Ahmed Hassan',
      age: 25,
      userType: 'special_needs',
      privilegeVerified: true
    }
  });
  console.log('Created users');

  // Create sample pullers
  const cuetLocation = await prisma.location.findFirst({ where: { blockId: 'block_cuet' } });
  const pahartoliLocation = await prisma.location.findFirst({ where: { blockId: 'block_pahartoli' } });

  const puller1 = await prisma.puller.create({
    data: {
      name: 'Karim Uddin',
      phone: '+8801712345678',
      isOnline: true,
      currentLatitude: cuetLocation?.latitude,
      currentLongitude: cuetLocation?.longitude
    }
  });

  const puller2 = await prisma.puller.create({
    data: {
      name: 'Rashid Ali',
      phone: '+8801723456789',
      isOnline: true,
      currentLatitude: pahartoliLocation?.latitude,
      currentLongitude: pahartoliLocation?.longitude
    }
  });

  const puller3 = await prisma.puller.create({
    data: {
      name: 'Hasan Mia',
      phone: '+8801734567890',
      isOnline: false
    }
  });
  console.log('Created pullers');

  // Create sample completed rides
  if (cuetLocation && pahartoliLocation) {
    const ride1 = await prisma.ride.create({
      data: {
        userId: user1.id,
        pullerId: puller1.id,
        pickupLocationId: cuetLocation.id,
        destinationLocationId: pahartoliLocation.id,
        status: 'completed',
        pointsAwarded: 8.5,
        pointsStatus: 'rewarded',
        pickupLatitude: cuetLocation.latitude,
        pickupLongitude: cuetLocation.longitude,
        dropoffLatitude: pahartoliLocation.latitude,
        dropoffLongitude: pahartoliLocation.longitude,
        distanceFromBlock: 45,
        acceptedAt: new Date(Date.now() - 3600000),
        pickupConfirmedAt: new Date(Date.now() - 3300000),
        completedAt: new Date(Date.now() - 3000000)
      }
    });

    await prisma.puller.update({
      where: { id: puller1.id },
      data: {
        points: { increment: 8.5 },
        totalRides: { increment: 1 }
      }
    });

    await prisma.pointsHistory.create({
      data: {
        pullerId: puller1.id,
        rideId: ride1.id,
        points: 8.5,
        type: 'earned',
        description: 'Ride completed - 8.5 points'
      }
    });

    const noaparaLocation = await prisma.location.findFirst({ where: { blockId: 'block_noapara' } });
    if (noaparaLocation) {
      const ride2 = await prisma.ride.create({
        data: {
          userId: user2.id,
          pullerId: puller2.id,
          pickupLocationId: cuetLocation.id,
          destinationLocationId: noaparaLocation.id,
          status: 'completed',
          pointsAwarded: 9.5,
          pointsStatus: 'rewarded',
          pickupLatitude: cuetLocation.latitude,
          pickupLongitude: cuetLocation.longitude,
          dropoffLatitude: noaparaLocation.latitude,
          dropoffLongitude: noaparaLocation.longitude,
          distanceFromBlock: 20,
          acceptedAt: new Date(Date.now() - 7200000),
          pickupConfirmedAt: new Date(Date.now() - 6900000),
          completedAt: new Date(Date.now() - 6600000)
        }
      });

      await prisma.puller.update({
        where: { id: puller2.id },
        data: {
          points: { increment: 9.5 },
          totalRides: { increment: 1 }
        }
      });

      await prisma.pointsHistory.create({
        data: {
          pullerId: puller2.id,
          rideId: ride2.id,
          points: 9.5,
          type: 'earned',
          description: 'Ride completed - 9.5 points'
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
