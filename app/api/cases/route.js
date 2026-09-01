import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where = {
      doctorId: session.user.id,
    };

    if (patientId) {
      where.patientId = patientId;
    }

    const cases = await prisma.caseRecord.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            contact: true,
            abhaId: true,
            prakritiType: true,
          },
        },
      },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Failed to fetch case records' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientId,
      visitDate,
      chiefComplaint,
      duration,
      hpi,
      pastMedicalHistory,
      familyHistory,
      vataScore,
      pittaScore,
      kaphaScore,
      prakritiResult,
      prakritiAnswers,
      nadiPariksha,
      jihvaPariksha,
      malaPariksha,
      mutraPariksha,
      sparshaPariksha,
      drukPariksha,
      shabdaPariksha,
      aakritiPariksha,
      agniType,
      koshtaType,
      ayurvedicDiagnosis,
      modernDiagnosis,
      prognosis,
      prescription,
      panchakarmaAdvice,
      pathyaDiet,
      apathyaDiet,
      lifestyleAdvice,
      followUpDate,
    } = body;

    if (!patientId || !chiefComplaint || !ayurvedicDiagnosis) {
      return NextResponse.json(
        { error: 'Patient, Chief Complaint, and Ayurvedic Diagnosis are required fields' },
        { status: 400 }
      );
    }

    // Verify patient belongs to this doctor
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, doctorId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Stringify prescription if array
    const prescriptionStr =
      typeof prescription === 'string'
        ? prescription
        : JSON.stringify(prescription || []);

    const newCase = await prisma.caseRecord.create({
      data: {
        patientId,
        doctorId: session.user.id,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        chiefComplaint: chiefComplaint.trim(),
        duration: duration?.trim() || null,
        hpi: hpi?.trim() || null,
        pastMedicalHistory: pastMedicalHistory?.trim() || null,
        familyHistory: familyHistory?.trim() || null,
        vataScore: parseInt(vataScore || 0, 10),
        pittaScore: parseInt(pittaScore || 0, 10),
        kaphaScore: parseInt(kaphaScore || 0, 10),
        prakritiResult: prakritiResult?.trim() || null,
        prakritiAnswers: prakritiAnswers ? JSON.stringify(prakritiAnswers) : null,
        nadiPariksha: nadiPariksha?.trim() || null,
        jihvaPariksha: jihvaPariksha?.trim() || null,
        malaPariksha: malaPariksha?.trim() || null,
        mutraPariksha: mutraPariksha?.trim() || null,
        sparshaPariksha: sparshaPariksha?.trim() || null,
        drukPariksha: drukPariksha?.trim() || null,
        shabdaPariksha: shabdaPariksha?.trim() || null,
        aakritiPariksha: aakritiPariksha?.trim() || null,
        agniType: agniType?.trim() || null,
        koshtaType: koshtaType?.trim() || null,
        ayurvedicDiagnosis: ayurvedicDiagnosis.trim(),
        modernDiagnosis: modernDiagnosis?.trim() || null,
        prognosis: prognosis?.trim() || null,
        prescription: prescriptionStr,
        panchakarmaAdvice: panchakarmaAdvice?.trim() || null,
        pathyaDiet: pathyaDiet?.trim() || null,
        apathyaDiet: apathyaDiet?.trim() || null,
        lifestyleAdvice: lifestyleAdvice?.trim() || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    // Update patient's prakritiType if assessed
    if (prakritiResult) {
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          prakritiType: prakritiResult,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { message: 'Case record created successfully', caseRecord: newCase },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating case record:', error);
    return NextResponse.json({ error: 'Failed to save case record' }, { status: 500 });
  }
}
