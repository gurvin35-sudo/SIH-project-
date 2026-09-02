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
        documents: {
          orderBy: { docDate: 'desc' },
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
    const {
      name,
      age,
      gender,
      contact,
      email,
      address,
      bloodGroup,
      allergies,
      prakritiType,
      preConsultationStatus,
      chiefComplaint,
      duration,
      hpi,
      pastMedicalHistory,
      pastSurgicalHistory,
      currentMedicines,
      familyHistory,
      personalHistory,
      reviewOfSystems,
      ayushAgni,
      ayushKoshta,
      aiSummary,
      redFlags,
    } = body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (age !== undefined) dataToUpdate.age = age ? parseInt(age) : null;
    if (gender !== undefined) dataToUpdate.gender = gender;
    if (contact !== undefined) dataToUpdate.contact = contact;
    if (email !== undefined) dataToUpdate.email = email;
    if (address !== undefined) dataToUpdate.address = address;
    if (bloodGroup !== undefined) dataToUpdate.bloodGroup = bloodGroup;
    if (allergies !== undefined) dataToUpdate.allergies = allergies;
    if (prakritiType !== undefined) dataToUpdate.prakritiType = prakritiType;
    if (preConsultationStatus !== undefined) dataToUpdate.preConsultationStatus = preConsultationStatus;
    if (chiefComplaint !== undefined) dataToUpdate.chiefComplaint = chiefComplaint;
    if (duration !== undefined) dataToUpdate.duration = duration;
    if (hpi !== undefined) dataToUpdate.hpi = hpi;
    if (pastMedicalHistory !== undefined) dataToUpdate.pastMedicalHistory = pastMedicalHistory;
    if (pastSurgicalHistory !== undefined) dataToUpdate.pastSurgicalHistory = pastSurgicalHistory;
    if (currentMedicines !== undefined) dataToUpdate.currentMedicines = currentMedicines;
    if (familyHistory !== undefined) dataToUpdate.familyHistory = familyHistory;
    if (personalHistory !== undefined) dataToUpdate.personalHistory = personalHistory;
    if (reviewOfSystems !== undefined) dataToUpdate.reviewOfSystems = reviewOfSystems;
    if (ayushAgni !== undefined) dataToUpdate.ayushAgni = ayushAgni;
    if (ayushKoshta !== undefined) dataToUpdate.ayushKoshta = ayushKoshta;
    if (aiSummary !== undefined) dataToUpdate.aiSummary = typeof aiSummary === 'object' ? JSON.stringify(aiSummary) : aiSummary;
    if (redFlags !== undefined) dataToUpdate.redFlags = typeof redFlags === 'object' ? JSON.stringify(redFlags) : redFlags;

    const updated = await prisma.patient.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        documents: {
          orderBy: { docDate: 'desc' },
        },
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
