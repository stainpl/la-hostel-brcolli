// src/pages/api/admin/students/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { IncomingForm, type Fields, type Files, type File } from 'formidable';
import path from 'path';
import { withLogging } from '@/lib/withLogging';

// Disable built-in body parsing so formidable can handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

// Extend Formidable's File type to include newFilename (used in v3)
interface FileWithNewName extends File {
  newFilename?: string;
}

// Parse with formidable
function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

// Extract uploaded file path
function getUploadedFilePath(fileInput?: File | File[]): string | undefined {
  if (!fileInput) return undefined;
  const file = Array.isArray(fileInput) ? fileInput[0] : (fileInput as FileWithNewName);
  const filename = file.newFilename || path.basename(file.filepath);
  return `/uploads/${filename}`;
}

// API handler
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Auth check
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const id = Number(req.query.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  try {
    // Parse incoming form data
    const { fields, files } = await parseForm(req);

    // Extract typed values
    const rawHasPaid = fields.hasPaid;
    const fullName     = String(fields.fullName || '');
    const regNo        = String(fields.regNo || '');
    const phone        = String(fields.phone || '');
    const email        = String(fields.email || '');
    const state        = String(fields.state || '');
    const lga          = String(fields.lga || '');
    const gender       = String(fields.gender || '') as 'MALE' | 'FEMALE';
    const sponsorName  = String(fields.sponsorName || '');
    const sponsorPhone = String(fields.sponsorPhone || '');
    const sessionYear  = String(fields.sessionYear || '');
    const roomId       = fields.roomId ? Number(fields.roomId) : null;
    const hasPaid      = rawHasPaid === 'true' || rawHasPaid === 'on';

    // Handle file upload
    const profilePhoto = getUploadedFilePath(files.profilePhoto);

    // Perform update
    await prisma.student.update({
      where: { id },
      data: {
        fullName,
        regNo,
        phone,
        email,
        state,
        lga,
        gender,
        sponsorName,
        sponsorPhone,
        sessionYear,
        roomId,
        hasPaid,
        ...(profilePhoto ? { profilePhoto } : {}),
      },
    });

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error('[/api/admin/students/[id]] update error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ message });
  }
}

export default withLogging(handler, 'admin.students.update');
