import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Please enter your 14-digit ABHA ID or Registered Mobile Number' },
        { status: 400 }
      );
    }

    const clean = identifier.trim();
    const cleanDigits = clean.replace(/\D/g, '');

    // Search by ABHA ID or Contact Number or Email
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { abhaId: clean },
          { abhaId: { contains: cleanDigits.length >= 10 ? cleanDigits : clean } },
          { contact: { contains: cleanDigits.length >= 10 ? cleanDigits : clean } },
          { contact: clean },
          { email: clean.toLowerCase() },
        ],
      },
      include: {
        cases: {
          orderBy: { visitDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'No patient record found with this ABHA ID or Mobile number' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Patient verified successfully',
      patient: {
        id: patient.id,
        name: patient.name,
        abhaId: patient.abhaId,
        contact: patient.contact,
        prakritiType: patient.prakritiType,
      },
    });
  } catch (error) {
    console.error('Patient login error:', error);
    return NextResponse.json(
      { error: 'Failed to verify patient credentials' },
      { status: 500 }
    );
  }
}
