import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCaseAISynthesis } from '@/lib/ai-summary';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const caseRecord = await prisma.caseRecord.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case record not found' }, { status: 404 });
    }

    const synthesis = generateCaseAISynthesis(caseRecord, caseRecord.patient, {
      language: lang,
    });

    return NextResponse.json({ synthesis });
  } catch (error) {
    console.error('Error generating case AI synthesis:', error);
    return NextResponse.json(
      { error: 'Failed to generate case AI synthesis' },
      { status: 500 }
    );
  }
}
