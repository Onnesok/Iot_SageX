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

// Calculate points based on distance from block
function calculatePoints(distanceFromBlock: number): number {
  const basePoints = 10;
  const distancePenalty = distanceFromBlock / 10; // 1 point per 10m
  const finalPoints = Math.max(0, basePoints - distancePenalty);
  return Math.round(finalPoints * 10) / 10; // Round to 1 decimal
}

// GET /api/stats - Get system statistics for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const allRides = await prisma.ride.findMany({
      include: {
        destinationLocation: true
      }
    });
    
    const allPullers = await prisma.puller.findMany();
    const onlinePullers = allPullers.filter(p => p.isOnline);
    const activeRequests = allRides.filter(r => r.status === 'pending');

    // Active users on blocks (users with non-completed/non-cancelled rides)
    const activeUserIds = new Set(
      allRides
        .filter(r => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected')
        .map(r => r.userId)
    );

    // Calculate statistics
    const totalRides = allRides.length;
    const completedRides = allRides.filter(r => r.status === 'completed').length;
    const activeRides = allRides.filter(r => 
      r.status === 'accepted' || r.status === 'pickup_confirmed' || r.status === 'in_progress'
    ).length;

    // Most requested destinations
    const destinationCounts = new Map<string, number>();
    allRides.forEach(ride => {
      const count = destinationCounts.get(ride.destinationLocationId) || 0;
      destinationCounts.set(ride.destinationLocationId, count + 1);
    });

    const mostRequestedDestinations = Array.from(destinationCounts.entries())
      .map(([locationId, count]) => {
        const location = allRides.find(r => r.destinationLocationId === locationId)?.destinationLocation;
        return {
          locationId,
          locationName: location?.name || 'Unknown',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average wait time (time from request to acceptance)
    const acceptedRides = allRides.filter(r => r.acceptedAt && r.createdAt);
    const avgWaitTime = acceptedRides.length > 0
      ? acceptedRides.reduce((sum, ride) => {
          const waitTime = new Date(ride.acceptedAt!).getTime() - new Date(ride.createdAt).getTime();
          return sum + waitTime;
        }, 0) / acceptedRides.length / 1000 // Convert to seconds
      : 0;

    // Average completion time
    const completedRidesWithTime = allRides.filter(r => r.completedAt && r.createdAt);
    const avgCompletionTime = completedRidesWithTime.length > 0
      ? completedRidesWithTime.reduce((sum, ride) => {
          const completionTime = new Date(ride.completedAt!).getTime() - new Date(ride.createdAt).getTime();
          return sum + completionTime;
        }, 0) / completedRidesWithTime.length / 1000 / 60 // Convert to minutes
      : 0;

    // Puller leaderboard
    const pullerLeaderboard = allPullers
      .map(puller => ({
        id: puller.id,
        name: puller.name,
        points: puller.points,
        totalRides: puller.totalRides
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    // Pending point reviews
    const pendingReviews = allRides.filter(r => r.pointsStatus === 'under_review').length;

    const allUsers = await prisma.user.findMany();

    return NextResponse.json({
      overview: {
        totalUsers: allUsers.length,
        totalPullers: allPullers.length,
        activeUsersOnBlocks: activeUserIds.size,
        onlinePullers: onlinePullers.length,
        activeRides,
        pendingRequests: activeRequests.length,
        totalRides,
        completedRides
      },
      analytics: {
        mostRequestedDestinations,
        avgWaitTime: Math.round(avgWaitTime),
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        pullerLeaderboard,
        pendingReviews
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
