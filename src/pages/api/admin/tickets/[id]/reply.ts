import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { withLogging } from '@/lib/withLogging';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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

  const { message } = req.body ?? {};
  if (typeof message !== 'string' || message.trim().length < 1) {
    return res.status(400).json({ message: 'Reply cannot be empty.' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        author: 'admin',
        message: message.trim(),
      },
    });


    return res.status(201).json(reply);
  } catch (err: unknown) {
    console.error('[/api/admin/tickets/[id]/reply] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error.';
    return res.status(500).json({ message });
  }
}

export default withLogging(handler, 'admin.tickets.reply');
