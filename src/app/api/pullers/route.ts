import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/pullers - Get all pullers or online pullers
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const online = searchParams.get('online');

  try {
    if (online === 'true') {
      const onlinePullers = await prisma.puller.findMany({
        where: { isOnline: true },
        orderBy: { name: 'asc' }
      });
      return NextResponse.json({ pullers: onlinePullers });
    }

    const allPullers = await prisma.puller.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ pullers: allPullers });
  } catch (error) {
    console.error('Error fetching pullers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pullers' },
      { status: 500 }
    );
  }
}

// POST /api/pullers - Create a new puller
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const puller = await prisma.puller.create({
      data: {
        name,
        phone,
        isOnline: false,
        points: 0,
        totalRides: 0
      }
    });

    return NextResponse.json({ puller }, { status: 201 });
  } catch (error) {
    console.error('Error creating puller:', error);
    return NextResponse.json(
      { error: 'Failed to create puller' },
      { status: 500 }
    );
  }
}
