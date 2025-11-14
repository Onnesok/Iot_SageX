import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// GET /api/pullers/[id]/nearby?latitude=X&longitude=Y&rideId=Z
// Get nearby pullers for a ride request, sorted by distance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const rideId = searchParams.get('rideId');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude required' },
        { status: 400 }
      );
    }

    const onlinePullers = await prisma.puller.findMany({
      where: { 
        isOnline: true,
        currentLatitude: { not: null },
        currentLongitude: { not: null }
      }
    });
    
    // Calculate distance for each puller and sort
    const pullersWithDistance = onlinePullers
      .map(puller => {
        if (!puller.currentLatitude || !puller.currentLongitude) {
          return null;
        }
        const distance = calculateDistance(
          latitude,
          longitude,
          puller.currentLatitude,
          puller.currentLongitude
        );
        return {
          ...puller,
          distance: Math.round(distance) // Distance in meters
        };
      })
      .filter(p => p !== null)
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 5); // Top 5 nearest pullers

    return NextResponse.json({
      pullers: pullersWithDistance,
      rideId
    });
  } catch (error) {
    console.error('Error fetching nearby pullers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby pullers' },
      { status: 500 }
    );
  }
}
