import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID required' },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true
      }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify admin' },
      { status: 500 }
    );
  }
}

