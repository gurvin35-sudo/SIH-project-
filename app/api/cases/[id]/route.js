import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const caseRecord = await prisma.caseRecord.findFirst({
      where: {
        id: params.id,
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
    await prisma.caseRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 });
  }
}
