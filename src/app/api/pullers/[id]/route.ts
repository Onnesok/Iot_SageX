import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to check if string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// GET /api/pullers/[id] - Get a specific puller (by ObjectId or phone number)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by ObjectId first, then by phone number
    let puller;
    if (isValidObjectId(id)) {
      puller = await prisma.puller.findFirst({
        where: { id }
      });
    } else {
      // If not a valid ObjectId, try to find by phone number
      puller = await prisma.puller.findFirst({
        where: { phone: id }
      });
    }

    if (!puller) {
      return NextResponse.json(
        { error: 'Puller not found. Please use a valid Puller ID or phone number.' },
        { status: 404 }
      );
    }

    const pointsHistory = await prisma.pointsHistory.findMany({
      where: { pullerId: puller.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const rides = await prisma.ride.findMany({
      where: { pullerId: puller.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      puller,
      pointsHistory,
      recentRides: rides
    });
  } catch (error) {
    console.error('Error fetching puller:', error);
    return NextResponse.json(
      { error: 'Failed to fetch puller' },
      { status: 500 }
    );
  }
}

// PATCH /api/pullers/[id] - Update puller status or location (by ObjectId or phone number)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isOnline, latitude, longitude } = body;

    // Find puller first (by ObjectId or phone number)
    let puller;
    if (isValidObjectId(id)) {
      puller = await prisma.puller.findFirst({
        where: { id }
      });
    } else {
      puller = await prisma.puller.findFirst({
        where: { phone: id }
      });
    }

    if (!puller) {
      return NextResponse.json(
        { error: 'Puller not found. Please use a valid Puller ID or phone number.' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (typeof isOnline === 'boolean') {
      updateData.isOnline = isOnline;
    }
    if (latitude !== undefined && longitude !== undefined) {
      updateData.currentLatitude = latitude;
      updateData.currentLongitude = longitude;
    }

    const updatedPuller = await prisma.puller.update({
      where: { id: puller.id },
      data: updateData
    });

    return NextResponse.json({ puller: updatedPuller });
  } catch (error) {
    console.error('Error updating puller:', error);
    return NextResponse.json(
      { error: 'Failed to update puller' },
      { status: 500 }
    );
  }
}
