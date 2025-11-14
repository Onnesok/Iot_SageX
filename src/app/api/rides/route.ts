import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LEGACY_LOCATION_ID_MAP: Record<string, string> = {
  loc_1: 'block_cuet',
  loc_2: 'block_pahartoli',
  loc_3: 'block_noapara',
  loc_4: 'block_raojan'
};

const LEGACY_USER_ID_MAP: Record<string, { name?: string }> = {
  user_block_cuet: { name: 'Abdul Rahman' }
};

const isValidObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

async function findLocationByIdentifier(identifier: string | undefined | null) {
  if (!identifier) return null;

  if (isValidObjectId(identifier)) {
    const byId = await prisma.location.findUnique({ where: { id: identifier } });
    if (byId) return byId;
  }

  const normalized = LEGACY_LOCATION_ID_MAP[identifier] ?? identifier;

  return prisma.location.findFirst({
    where: {
      OR: [
        { blockId: normalized },
        { name: normalized }
      ]
    }
  });
}

async function findUserByIdentifier(identifier: string | undefined | null) {
  if (!identifier) return null;

  if (isValidObjectId(identifier)) {
    const byId = await prisma.user.findUnique({ where: { id: identifier } });
    if (byId) return byId;
  }

  const legacy = LEGACY_USER_ID_MAP[identifier];
  if (legacy?.name) {
    const byName = await prisma.user.findFirst({ where: { name: legacy.name } });
    if (byName) return byName;
  }

  return prisma.user.findFirst({
    where: { name: identifier }
  });
}

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
    const {
      userId: userIdentifier,
      pickupLocationId: pickupIdentifier,
      destinationLocationId: destinationIdentifier
    } = body;

    if (!userIdentifier || !pickupIdentifier || !destinationIdentifier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await findUserByIdentifier(userIdentifier);
    const pickupLocation = await findLocationByIdentifier(pickupIdentifier);
    const destinationLocation = await findLocationByIdentifier(destinationIdentifier);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid user reference' },
        { status: 400 }
      );
    }

    if (!pickupLocation || !destinationLocation) {
      return NextResponse.json(
        { error: 'Invalid location reference' },
        { status: 400 }
      );
    }

    const ride = await prisma.ride.create({
      data: {
        userId: user.id,
        pickupLocationId: pickupLocation.id,
        destinationLocationId: destinationLocation.id,
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
