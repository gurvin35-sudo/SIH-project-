import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const documents = await prisma.medicalDocument.findMany({
      where: { patientId },
      orderBy: { docDate: 'desc' }
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch medical documents' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, title, docType, docDate, fileUrl, ocrText, extractedData, summary, uploadedBy = 'patient' } = body;

    if (!patientId || !title) {
      return NextResponse.json({ error: 'patientId and title are required' }, { status: 400 });
    }

    const newDoc = await prisma.medicalDocument.create({
      data: {
        patientId,
        title,
        docType: docType || 'Medical Report',
        docDate: docDate ? new Date(docDate) : new Date(),
        fileUrl: fileUrl || null,
        ocrText: ocrText || '',
        extractedData: typeof extractedData === 'object' ? JSON.stringify(extractedData) : extractedData || '{}',
        summary: summary || '',
        uploadedBy
      }
    });

    return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
}
