import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, regNumber, clinicName, specialty, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if doctor already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email: cleanEmail },
    });

    if (existingDoctor) {
      return NextResponse.json(
        { error: 'A doctor account already exists with this email address' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = await prisma.doctor.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        regNumber: regNumber?.trim() || null,
        clinicName: clinicName?.trim() || 'Ayurvedic Wellness Clinic',
        specialty: specialty?.trim() || 'Ayurveda & Panchakarma',
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Doctor account created successfully',
        doctor: {
          id: newDoctor.id,
          name: newDoctor.name,
          email: newDoctor.email,
          regNumber: newDoctor.regNumber,
          clinicName: newDoctor.clinicName,
          specialty: newDoctor.specialty,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating account' },
      { status: 500 }
    );
  }
}
