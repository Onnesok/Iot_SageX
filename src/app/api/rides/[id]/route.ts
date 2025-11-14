import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const isValidObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

async function resolvePuller(identifier: string | undefined | null) {
  if (!identifier) return null;

  if (isValidObjectId(identifier)) {
    const byId = await prisma.puller.findUnique({ where: { id: identifier } });
    if (byId) return byId;
  }

  const candidates = [
    identifier,
    identifier.startsWith('+') ? identifier : `+${identifier}`
  ];

  return prisma.puller.findFirst({
    where: {
      OR: [
        { phone: { in: candidates } },
        { name: identifier }
      ]
    }
  });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Calculate points based on distance from block
function calculatePoints(distanceFromBlock: number): number {
  const basePoints = 10;
  const distancePenalty = distanceFromBlock / 10; // 1 point per 10m
  const finalPoints = Math.max(0, basePoints - distancePenalty);
  return Math.round(finalPoints * 10) / 10; // Round to 1 decimal
}

// GET /api/rides/[id] - Get a specific ride
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ride = await prisma.ride.findFirst({
      where: { id },
      include: {
        pickupLocation: true,
        destinationLocation: true
      }
    });

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ride });
  } catch (error) {
    console.error('Error fetching ride:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ride' },
      { status: 500 }
    );
  }
}

// PATCH /api/rides/[id] - Update ride status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, pullerId, latitude, longitude, points } = body;

    const ride = await prisma.ride.findFirst({
      where: { id },
      include: {
        destinationLocation: true
      }
    });

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'accept':
        if (!pullerId) {
          return NextResponse.json(
            { error: 'Puller ID required' },
            { status: 400 }
          );
        }
        const acceptingPuller = await resolvePuller(pullerId);
        if (!acceptingPuller) {
          return NextResponse.json(
            { error: 'Puller not found' },
            { status: 404 }
          );
        }
        updateData = {
          status: 'accepted',
          pullerId: acceptingPuller.id,
          acceptedAt: new Date()
        };
        break;

      case 'reject':
        updateData = {
          status: 'rejected'
        };
        break;

      case 'confirm_pickup':
        if (!pullerId || !ride.pullerId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
        const pickupPuller = await resolvePuller(pullerId);
        if (!pickupPuller || pickupPuller.id !== ride.pullerId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
        updateData = {
          status: 'pickup_confirmed',
          pickupConfirmedAt: new Date()
        };
        break;

      case 'complete':
        if (!pullerId || !ride.pullerId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
        const completingPuller = await resolvePuller(pullerId);
        if (!completingPuller || completingPuller.id !== ride.pullerId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
        if (!latitude || !longitude) {
          return NextResponse.json(
            { error: 'Drop-off location required' },
            { status: 400 }
          );
        }

        if (!ride.destinationLocation) {
          return NextResponse.json(
            { error: 'Destination location not found' },
            { status: 400 }
          );
        }

        const distanceFromBlock = calculateDistance(
          latitude,
          longitude,
          ride.destinationLocation.latitude,
          ride.destinationLocation.longitude
        );

        let pointsAwarded = 0;
        let pointsStatus: 'pending' | 'rewarded' | 'under_review' = 'pending';

        if (distanceFromBlock <= 50) {
          pointsAwarded = calculatePoints(distanceFromBlock);
          pointsStatus = 'rewarded';
          
          // Award points to puller
          await prisma.puller.update({
            where: { id: completingPuller.id },
            data: {
              points: { increment: pointsAwarded },
              totalRides: { increment: 1 }
            }
          });
          
          await prisma.pointsHistory.create({
            data: {
              pullerId: completingPuller.id,
              rideId: id,
              points: pointsAwarded,
              type: 'earned',
              description: `Ride completed - ${pointsAwarded} points`
            }
          });
        } else if (distanceFromBlock <= 100) {
          pointsAwarded = calculatePoints(distanceFromBlock);
          pointsStatus = 'rewarded';
          
          await prisma.puller.update({
            where: { id: completingPuller.id },
            data: {
              points: { increment: pointsAwarded },
              totalRides: { increment: 1 }
            }
          });
          
          await prisma.pointsHistory.create({
            data: {
              pullerId: completingPuller.id,
              rideId: id,
              points: pointsAwarded,
              type: 'earned',
              description: `Ride completed (reduced points) - ${pointsAwarded} points`
            }
          });
        } else {
          pointsStatus = 'under_review';
        }

        updateData = {
          status: 'completed',
          completedAt: new Date(),
          dropoffLatitude: latitude,
          dropoffLongitude: longitude,
          distanceFromBlock,
          pointsAwarded,
          pointsStatus
        };
        break;

      case 'cancel':
        updateData = {
          status: 'cancelled'
        };
        break;

      case 'adjust_points':
        if (!points || typeof points !== 'number') {
          return NextResponse.json(
            { error: 'Points value required' },
            { status: 400 }
          );
        }
        
        const oldPoints = ride.pointsAwarded || 0;
        const newPoints = points;
        const pointsDifference = newPoints - oldPoints;
        
        // Update ride points
        updateData = {
          pointsAwarded: newPoints,
          pointsStatus: 'rewarded'
        };
        
        // Update puller points if ride has a puller
        if (ride.pullerId) {
          await prisma.puller.update({
            where: { id: ride.pullerId },
            data: {
              points: { increment: pointsDifference }
            }
          });
          
          await prisma.pointsHistory.create({
            data: {
              pullerId: ride.pullerId,
              rideId: id,
              points: pointsDifference,
              type: 'adjusted',
              description: `Admin adjusted points: ${oldPoints} → ${newPoints}`
            }
          });
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: updateData,
      include: {
        pickupLocation: true,
        destinationLocation: true
      }
    });

    return NextResponse.json({ ride: updatedRide });
  } catch (error) {
    console.error('Error updating ride:', error);
    return NextResponse.json(
      { error: 'Failed to update ride' },
      { status: 500 }
    );
  }
}
