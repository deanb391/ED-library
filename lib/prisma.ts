import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local if present, otherwise default dotenv
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString === 'undefined') {
    throw new Error('DATABASE_URL is missing or undefined in environment variables');
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const getPrisma = (): PrismaClientSingleton => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  const client = prismaClientSingleton();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
};

const prisma = getPrisma();

export { prisma };
export default prisma;
