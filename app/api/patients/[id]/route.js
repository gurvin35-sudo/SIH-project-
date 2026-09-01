import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
      },
      include: {
        cases: {
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json({ error: 'Failed to fetch patient details' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let doctorId = session?.user?.id;
    if (!doctorId) {
      const doc = await prisma.doctor.findFirst();
      if (doc) doctorId = doc.id;
    }

    const body = await request.json();
    const { name, age, gender, contact, email, address, bloodGroup, allergies, prakritiType } = body;

    const updated = await prisma.patient.update({
      where: { id: params.id },
      data: {
        name,
        age: age ? parseInt(age) : null,
        gender,
        contact,
        email,
        address,
        bloodGroup,
        allergies,
        prakritiType,
      },
    });

    return NextResponse.json({ patient: updated });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.patient.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
