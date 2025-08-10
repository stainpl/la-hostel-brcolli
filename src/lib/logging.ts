import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { logEvent } from '@/lib/logger'

export const withLogging = (handler: NextApiHandler, context: string): NextApiHandler =>
  async (req, res) => {
    const start = Date.now()
    await logEvent('DEBUG', `→ ${context} called [${req.method}]`, context)
    try {
      await handler(req, res)
      await logEvent('INFO', `✔ ${context} succeeded [${req.method}]`, context)
    } catch (err: any) {
      await logEvent('ERROR', `✖ ${context} error: ${err.message}`, context)
      throw err
    } finally {
      await logEvent('DEBUG', `← ${context} done in ${Date.now() - start}ms`, context)
    }
  }
