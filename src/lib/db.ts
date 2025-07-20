// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Optional: immediately connect so the first query pays no extra latency
prisma
  .$connect()
  .then(() => console.log('✅ Prisma connected'))
  .catch((e: unknown) => {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('❌ Prisma connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
