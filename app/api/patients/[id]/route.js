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

    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        doctorId: session.user.id,
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, gender, contact, email, address, abhaId, bloodGroup, allergies, prakritiType } = body;

    const existing = await prisma.patient.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const updated = await prisma.patient.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : existing.name,
        age: age !== undefined ? parseInt(age, 10) : existing.age,
        gender: gender || existing.gender,
        contact: contact ? contact.trim() : existing.contact,
        email: email !== undefined ? email?.trim() : existing.email,
        address: address !== undefined ? address?.trim() : existing.address,
        abhaId: abhaId !== undefined ? abhaId?.trim() : existing.abhaId,
        bloodGroup: bloodGroup !== undefined ? bloodGroup?.trim() : existing.bloodGroup,
        allergies: allergies !== undefined ? allergies?.trim() : existing.allergies,
        prakritiType: prakritiType !== undefined ? prakritiType?.trim() : existing.prakritiType,
      },
    });

    return NextResponse.json({ message: 'Patient updated successfully', patient: updated });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.patient.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    await prisma.patient.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Patient and all associated cases deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
