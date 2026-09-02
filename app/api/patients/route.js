import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/auto-seed';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Auto-populate sample data if database is empty on Vercel/serverless
    await ensureDatabaseSeeded(prisma);

    const session = await getServerSession(authOptions);
    let doctorId = session?.user?.id;
    if (!doctorId) {
      const defaultDoc = await prisma.doctor.findFirst();
      if (defaultDoc) doctorId = defaultDoc.id;
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const gender = searchParams.get('gender') || '';
    const prakriti = searchParams.get('prakriti') || '';

    const where = {};

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { contact: { contains: q } },
        { abhaId: { contains: q } },
        { email: { contains: q } },
      ];
    }

    if (gender && gender !== 'all') {
      where.gender = gender;
    }

    if (prakriti && prakriti !== 'all') {
      where.prakritiType = { contains: prakriti };
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        cases: {
          select: {
            id: true,
            visitDate: true,
            ayurvedicDiagnosis: true,
            modernDiagnosis: true,
            prakritiResult: true,
          },
          orderBy: { visitDate: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients', details: error?.message, stack: error?.stack },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await ensureDatabaseSeeded(prisma);

    const session = await getServerSession(authOptions);
    let doctorId = session?.user?.id;
    if (!doctorId) {
      const defaultDoc = await prisma.doctor.findFirst();
      if (defaultDoc) doctorId = defaultDoc.id;
    }

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor account required to register patients' }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, gender, contact, email, address, abhaId, bloodGroup, allergies, prakritiType } = body;

    if (!name || !age || !gender || !contact) {
      return NextResponse.json(
        { error: 'Name, age, gender, and contact number are required' },
        { status: 400 }
      );
    }

    // Check if ABHA ID is unique if provided
    if (abhaId && abhaId.trim()) {
      const existing = await prisma.patient.findUnique({
        where: { abhaId: abhaId.trim() },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'A patient with this ABHA ID is already registered' },
          { status: 409 }
        );
      }
    }

    const newPatient = await prisma.patient.create({
      data: {
        doctorId: doctorId,
        name: name.trim(),
        age: parseInt(age, 10),
        gender: gender.trim(),
        contact: contact.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        abhaId: abhaId?.trim() || null,
        bloodGroup: bloodGroup?.trim() || null,
        allergies: allergies?.trim() || null,
        prakritiType: prakritiType?.trim() || null,
      },
    });

    return NextResponse.json({ message: 'Patient registered successfully', patient: newPatient }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient record', details: error?.message, stack: error?.stack },
      { status: 500 }
    );
  }
}
