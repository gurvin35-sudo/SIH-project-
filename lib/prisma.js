import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl() {
  // If running on Vercel Serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/dev.db';
    const possibleSourcePaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join(__dirname, 'prisma', 'dev.db'),
    ];

    try {
      if (!fs.existsSync(tmpDbPath)) {
        for (const src of possibleSourcePaths) {
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, tmpDbPath);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Failed to copy SQLite database to /tmp:', err);
    }

    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || 'file:./prisma/dev.db';
}

const globalForPrisma = global;

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
