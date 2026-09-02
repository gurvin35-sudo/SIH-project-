import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePatientAISummary } from '@/lib/ai-summary';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const notes = searchParams.get('notes') || '';

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        cases: {
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const aiSummary = generatePatientAISummary(patient, {
      language: lang,
      doctorNotes: notes,
    });

    return NextResponse.json({ summary: aiSummary });
  } catch (error) {
    console.error('Error generating patient AI summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI clinical summary' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const body = await request.json().catch(() => ({}));
    const { language = 'en', doctorNotes = '' } = body;

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        cases: {
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const aiSummary = generatePatientAISummary(patient, {
      language,
      doctorNotes,
    });

    return NextResponse.json({ summary: aiSummary });
  } catch (error) {
    console.error('Error generating patient AI summary via POST:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI clinical summary' },
      { status: 500 }
    );
  }
}
