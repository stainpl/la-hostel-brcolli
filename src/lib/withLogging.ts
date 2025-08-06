import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { logEvent } from './logger'

/**
 * Wraps any NextApiHandler so that:
 *  • On entry it logs a DEBUG
 *  • On normal exit it logs INFO
 *  • On exception it logs ERROR
 *  • Always logs DEBUG on exit with duration
 *
 * @param handler  your original handler
 * @param context  a short string to identify this route, e.g. 'room:list'
 */
export function withLogging(
  handler: NextApiHandler,
  context: string
): NextApiHandler {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    const start = Date.now()
    await logEvent('DEBUG', `→ [${context}] ${req.method} ${req.url}`, context)

    try {
      await handler(req, res)
      await logEvent('INFO', `✔ [${context}] succeeded`, context)
    } catch (err: any) {
      await logEvent('ERROR', `✖ [${context}] failed: ${err.message}`, context)
      // rethrow so Next returns 500 if you didn't handle it below
      throw err
    } finally {
      const ms = Date.now() - start
      await logEvent('DEBUG', `← [${context}] done in ${ms}ms`, context)
    }
  }
}