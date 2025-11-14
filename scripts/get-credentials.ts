import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  const pullers = await prisma.puller.findMany();
  const users = await prisma.user.findMany();
  const locations = await prisma.location.findMany();

  console.log('=== ADMIN CREDENTIALS ===');
  admins.forEach(a => {
    console.log(`Username: ${a.username}`);
    console.log(`Password: admin123 (default)`);
    console.log(`Name: ${a.name}`);
    console.log(`Email: ${a.email || 'N/A'}`);
    console.log('');
  });

  console.log('=== PULLER IDs (for Rickshaw Portal Login) ===');
  pullers.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Phone: ${p.phone}`);
    console.log(`Points: ${p.points}`);
    console.log(`Total Rides: ${p.totalRides}`);
    console.log(`Status: ${p.isOnline ? 'Online' : 'Offline'}`);
    console.log('');
  });

  console.log('=== USERS (Reference) ===');
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`Name: ${u.name}`);
    console.log(`Age: ${u.age}`);
    console.log(`Type: ${u.userType}`);
    console.log(`Verified: ${u.privilegeVerified}`);
    console.log('');
  });

  console.log('=== LOCATIONS ===');
  locations.forEach(l => {
    console.log(`ID: ${l.id}`);
    console.log(`Name: ${l.name}`);
    console.log(`Block ID: ${l.blockId}`);
    console.log(`Coordinates: ${l.latitude}, ${l.longitude}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);

