import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import os from 'os';

function getDatabaseUrl() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join(os.tmpdir(), 'ayushcase_dev.db');
    const possibleSources = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
    ];

    try {
      if (!fs.existsSync(tmpDbPath)) {
        for (const src of possibleSources) {
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, tmpDbPath);
            break;
          }
        }
      }
    } catch (e) {
      console.warn('Could not copy db to tmpdir:', e.message);
    }

    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || 'file:./prisma/dev.db';
}

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
