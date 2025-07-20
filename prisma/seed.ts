import dotenv from 'dotenv'


import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'


dotenv.config()

async function main() {
  const prisma = new PrismaClient()
  const email = process.env.ADMIN_SEED_EMAIL
  const password = process.env.ADMIN_SEED_PASSWORD

  if (!email || !password) {
    throw new Error('Please set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in .env')
  }

  const hashed = await bcrypt.hash(password, 10)

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash: hashed },
    create: {
      email,
      passwordHash: hashed,
    },
  })

  console.log(`Seeded admin: ${admin.email}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
