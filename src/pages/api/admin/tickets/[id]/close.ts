// src/pages/api/admin/tickets/[id]/close.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { withLogging } from '@/lib/withLogging';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const ticketId = Number(req.query.id);
  if (Number.isNaN(ticketId)) {
    return res.status(400).json({ message: 'Invalid ticket ID' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ message: 'Ticket already closed.' });
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' },
    });

    // TODO: Optionally send email notification to student

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error('[/api/admin/tickets/[id]/close] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error.';
    return res.status(500).json({ message });
  }
}

export default withLogging(handler, 'admin.tickets.close');
