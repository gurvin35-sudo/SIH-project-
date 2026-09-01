import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseRecord = await prisma.caseRecord.findFirst({
      where: {
        id: params.id,
        doctorId: session.user.id,
      },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            regNumber: true,
            clinicName: true,
            specialty: true,
            phone: true,
          },
        },
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case record not found' }, { status: 404 });
    }

    return NextResponse.json({ caseRecord });
  } catch (error) {
    console.error('Error fetching case record:', error);
    return NextResponse.json({ error: 'Failed to fetch case record' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.caseRecord.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Case record not found' }, { status: 404 });
    }

    await prisma.caseRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Case record deleted successfully' });
  } catch (error) {
    console.error('Error deleting case record:', error);
    return NextResponse.json({ error: 'Failed to delete case record' }, { status: 500 });
  }
}
