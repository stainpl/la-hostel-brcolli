import type { NextApiHandler } from 'next'
import { logEvent } from '@/lib/logger'

export const withLogging = (
  handler: NextApiHandler,
  context: string
): NextApiHandler =>
  async (req, res) => {
    const start = Date.now()
    await logEvent('DEBUG', `→ ${context} called [${req.method}]`, context)

    try {
      await handler(req, res)
      await logEvent('INFO', `✔ ${context} succeeded [${req.method}]`, context)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : JSON.stringify(err)
      await logEvent('ERROR', `✖ ${context} error: ${message}`, context)
      throw err
    } finally {
      await logEvent(
        'DEBUG',
        `← ${context} done in ${Date.now() - start}ms`,
        context
      )
    }
  }
