import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/auto-seed';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await ensureDatabaseSeeded(prisma);

    const session = await getServerSession(authOptions);
    let doctorId = session?.user?.id;
    if (!doctorId) {
      const defaultDoc = await prisma.doctor.findFirst();
      if (defaultDoc) doctorId = defaultDoc.id;
    }

    const whereDoc = doctorId ? { doctorId } : {};

    // Total Patients
    const totalPatients = await prisma.patient.count({
      where: whereDoc,
    });

    // Total Cases
    const totalCases = await prisma.caseRecord.count({
      where: whereDoc,
    });

    // Today's start and end
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const casesToday = await prisma.caseRecord.count({
      where: {
        doctorId,
        visitDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    // Upcoming Follow-ups (next 14 days)
    const now = new Date();
    const fourteenDaysAhead = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const upcomingFollowUps = await prisma.caseRecord.findMany({
      where: {
        doctorId,
        followUpDate: {
          gte: now,
          lte: fourteenDaysAhead,
        },
      },
      orderBy: { followUpDate: 'asc' },
      take: 5,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            contact: true,
            prakritiType: true,
          },
        },
      },
    });

    // Prakriti Distribution Breakdown
    const patients = await prisma.patient.findMany({
      where: { doctorId },
      select: { prakritiType: true },
    });

    const prakritiCounts = {
      'Vata dominant': 0,
      'Pitta dominant': 0,
      'Kapha dominant': 0,
      'Vata-Pitta': 0,
      'Pitta-Kapha': 0,
      'Vata-Kapha': 0,
      'Tridoshic (Balanced)': 0,
      'Unassessed': 0,
    };

    patients.forEach((p) => {
      const type = p.prakritiType;
      if (!type) {
        prakritiCounts['Unassessed']++;
      } else if (type.includes('Vata') && type.includes('Pitta')) {
        prakritiCounts['Vata-Pitta']++;
      } else if (type.includes('Pitta') && type.includes('Kapha')) {
        prakritiCounts['Pitta-Kapha']++;
      } else if (type.includes('Vata') && type.includes('Kapha')) {
        prakritiCounts['Vata-Kapha']++;
      } else if (type.includes('Vata')) {
        prakritiCounts['Vata dominant']++;
      } else if (type.includes('Pitta')) {
        prakritiCounts['Pitta dominant']++;
      } else if (type.includes('Kapha')) {
        prakritiCounts['Kapha dominant']++;
      } else if (type.includes('Tridoshic') || type.includes('Sama')) {
        prakritiCounts['Tridoshic (Balanced)']++;
      } else {
        prakritiCounts['Tridoshic (Balanced)']++;
      }
    });

    // Recent Cases
    const recentCases = await prisma.caseRecord.findMany({
      where: { doctorId },
      orderBy: { visitDate: 'desc' },
      take: 5,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            abhaId: true,
            prakritiType: true,
          },
        },
      },
    });

    // Recent Patients
    const recentPatients = await prisma.patient.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        cases: {
          orderBy: { visitDate: 'desc' },
          take: 1,
          select: {
            ayurvedicDiagnosis: true,
            visitDate: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalPatients,
        totalCases,
        casesToday,
        upcomingFollowUpsCount: upcomingFollowUps.length,
        prakritiCounts,
      },
      upcomingFollowUps,
      recentCases,
      recentPatients,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
