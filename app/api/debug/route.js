import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const info = {
    cwd: process.cwd(),
    tmpdir: os.tmpdir(),
    env_DATABASE_URL: process.env.DATABASE_URL,
    isVercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV,
    dbFileExistsInTmp: fs.existsSync(path.join(os.tmpdir(), 'ayushcase_dev.db')),
    tmpFiles: [],
    prismaError: null,
    patientsCount: null,
  };

  try {
    info.tmpFiles = fs.readdirSync(os.tmpdir()).slice(0, 10);
  } catch (e) {
    info.tmpFilesError = e.message;
  }

  try {
    const count = await prisma.patient.count();
    info.patientsCount = count;
  } catch (err) {
    info.prismaError = {
      message: err.message,
      code: err.code,
      stack: err.stack,
    };
  }

  return NextResponse.json(info);
}
