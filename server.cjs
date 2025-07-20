// server.js
require('dotenv').config()
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyDbConnection() {
  try {
    await prisma.$connect()
    console.log('Database connected')
  } catch (error) {
    console.error('❌ Database connection error:', error)
    process.exit(1)
  }
}

async function main() {
  await verifyDbConnection()

  const app = express()
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'OK' })
  })

  app.get('/test-db', async (_req, res) => {
    try {
      // optionally re-check
      await prisma.$connect()
      res.json({ db: 'connected' })
    } catch (error) {
      res.status(500).json({ error: 'DB connection failed', details: error.message })
    }
  })

  const port = process.env.SERVER_PORT || 3001
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })

  // On SIGINT, gracefully disconnect
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

main().catch((e) => {
  console.error('Unexpected error:', e)
  process.exit(1)
})
