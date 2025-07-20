// lib/prisma.ts
// ------------------------------------------------------------------------------------------------
// We deliberately use `require` and type `any` here to avoid TS/ESM export mismatches.
// The `@prisma/client` module at runtime definitely exports `PrismaClient`.
// ------------------------------------------------------------------------------------------------

// Disable ESLint/TS errors on this line
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
const { PrismaClient }: { PrismaClient: any } = require('@prisma/client')

declare global {
  // Prevent multiple instances of PrismaClient in development
  // by attaching to the globalThis object.
  var prisma: any
}

// Reuse or create the single PrismaClient instance
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // optional: logs queries to console
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
