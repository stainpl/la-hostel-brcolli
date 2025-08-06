// src/lib/logger.ts
import { prisma } from './prisma'

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export async function logEvent(
  level: LogLevel,
  message: string,
  context?: string
) { try {
  await prisma.log.create({
    data: { level, message, context },
  })
 } catch (e) {
  console.error('[logger] Failed to log event:', e)
  }
}