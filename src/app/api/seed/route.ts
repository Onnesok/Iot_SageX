import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/seed - Initialize demo data
export async function POST() {
  try {
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
    } else {
      admin = existingAdmin;
    }

    // Create locations
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
      const existing = await prisma.location.findFirst({
        where: { blockId: loc.blockId }
      });
      if (!existing) {
        await prisma.location.create({
          data: loc
        });
      }
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      admin: { username: admin.username }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
