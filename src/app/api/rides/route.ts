import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rides - Get all rides or active requests
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const pullerId = searchParams.get('pullerId');

  try {
    if (type === 'active') {
      const activeRequests = await prisma.ride.findMany({
        where: { status: 'pending' },
        include: {
          pickupLocation: true,
          destinationLocation: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ rides: activeRequests });
    }

    if (pullerId) {
      const rides = await prisma.ride.findMany({
        where: { pullerId },
        include: {
          pickupLocation: true,
          destinationLocation: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      return NextResponse.json({ rides });
    }

    const allRides = await prisma.ride.findMany({
      include: {
        pickupLocation: true,
        destinationLocation: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ rides: allRides });
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}

// POST /api/rides - Create a new ride request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pickupLocationId, destinationLocationId } = body;

    if (!userId || !pickupLocationId || !destinationLocationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pickupLocation = await prisma.location.findFirst({
      where: { id: pickupLocationId }
    });

    const destinationLocation = await prisma.location.findFirst({
      where: { id: destinationLocationId }
    });

    if (!pickupLocation || !destinationLocation) {
      return NextResponse.json(
        { error: 'Invalid location' },
        { status: 400 }
      );
    }

    const ride = await prisma.ride.create({
      data: {
        userId,
        pickupLocationId,
        destinationLocationId,
        pickupLatitude: pickupLocation.latitude,
        pickupLongitude: pickupLocation.longitude,
        status: 'pending',
        pointsStatus: 'pending'
      },
      include: {
        pickupLocation: true,
        destinationLocation: true
      }
    });

    return NextResponse.json({ ride }, { status: 201 });
  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json(
      { error: 'Failed to create ride' },
      { status: 500 }
    );
  }
}
