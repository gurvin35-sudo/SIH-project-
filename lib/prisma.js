import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import os from 'os';

function getDatabaseUrl() {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production'
  );

  if (isServerless) {
    const tmpDbPath = path.join(os.tmpdir(), 'ayushcase_dev.db');
    const possibleSources = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.resolve('./prisma/dev.db'),
      path.resolve('./dev.db'),
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

    const url = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  const defaultUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  process.env.DATABASE_URL = defaultUrl;
  return defaultUrl;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
