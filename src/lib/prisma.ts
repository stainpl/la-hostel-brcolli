import { PrismaClient } from '@prisma/client'


declare global {
  var prisma: PrismaClient
}

// Reuse or create the single PrismaClient instance
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], 
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
