// Seed script to initialize demo data
// Run this to populate the database with sample data

import { db } from './database';

export function seedDatabase() {
  // Create sample users
  const user1 = db.createUser({
    name: 'Abdul Rahman',
    age: 65,
    userType: 'senior',
    privilegeVerified: true
  });

  const user2 = db.createUser({
    name: 'Fatima Begum',
    age: 72,
    userType: 'senior',
    privilegeVerified: true
  });

  const user3 = db.createUser({
    name: 'Ahmed Hassan',
    age: 25,
    userType: 'special_needs',
    privilegeVerified: true
  });

  // Create sample pullers
  const puller1 = db.createPuller({
    name: 'Karim Uddin',
    phone: '+8801712345678',
    isOnline: true
  });
  db.updatePullerLocation(puller1.id, 22.4633, 91.9714); // CUET Campus

  const puller2 = db.createPuller({
    name: 'Rashid Ali',
    phone: '+8801723456789',
    isOnline: true
  });
  db.updatePullerLocation(puller2.id, 22.4700, 91.9800); // Near Pahartoli

  const puller3 = db.createPuller({
    name: 'Hasan Mia',
    phone: '+8801734567890',
    isOnline: false
  });
  db.updatePullerLocation(puller3.id, 22.4600, 91.9700); // Near Noapara

  // Create some sample completed rides
  const ride1 = db.createRide({
    userId: user1.id,
    pullerId: puller1.id,
    pickupLocationId: 'loc_1',
    destinationLocationId: 'loc_2',
    pickupLatitude: 22.4633,
    pickupLongitude: 91.9714
  });
  db.updateRide(ride1.id, {
    status: 'completed',
    acceptedAt: new Date(Date.now() - 3600000).toISOString(),
    pickupConfirmedAt: new Date(Date.now() - 3300000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
    dropoffLatitude: 22.4725,
    dropoffLongitude: 91.9845,
    distanceFromBlock: 45,
    pointsAwarded: 8.5,
    pointsStatus: 'rewarded'
  });
  db.updatePullerPoints(puller1.id, 8.5);
  db.addPointsHistory({
    pullerId: puller1.id,
    rideId: ride1.id,
    points: 8.5,
    type: 'earned',
    description: 'Ride completed - 8.5 points'
  });

  const ride2 = db.createRide({
    userId: user2.id,
    pullerId: puller2.id,
    pickupLocationId: 'loc_1',
    destinationLocationId: 'loc_3',
    pickupLatitude: 22.4633,
    pickupLongitude: 91.9714
  });
  db.updateRide(ride2.id, {
    status: 'completed',
    acceptedAt: new Date(Date.now() - 7200000).toISOString(),
    pickupConfirmedAt: new Date(Date.now() - 6900000).toISOString(),
    completedAt: new Date(Date.now() - 6600000).toISOString(),
    dropoffLatitude: 22.4580,
    dropoffLongitude: 91.9920,
    distanceFromBlock: 20,
    pointsAwarded: 9.5,
    pointsStatus: 'rewarded'
  });
  db.updatePullerPoints(puller2.id, 9.5);
  db.addPointsHistory({
    pullerId: puller2.id,
    rideId: ride2.id,
    points: 9.5,
    type: 'earned',
    description: 'Ride completed - 9.5 points'
  });

  return {
    users: [user1, user2, user3],
    pullers: [puller1, puller2, puller3],
    rides: [ride1, ride2]
  };
}

// Auto-seed on module load (for demo purposes)
if (typeof window === 'undefined') {
  // Only run on server side
  seedDatabase();
}

