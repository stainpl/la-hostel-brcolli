// pages/api/students/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { withLogging } from '@/lib/withLogging';

// Disable Next.js’s default JSON body parser for file uploads
export const config = {
  api: { bodyParser: false },
};

// Allowed gender values
type Gender = 'MALE' | 'FEMALE';

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function getField(fields: formidable.Fields, key: string): string {
  const val = fields[key];
  return Array.isArray(val) ? val[0] ?? '' : val ?? '';
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { fields, files } = await parseForm(req);

    const fullName = getField(fields, 'fullName');
    const regNo = getField(fields, 'regNo');
    const email = getField(fields, 'email');
    const phone = getField(fields, 'phone');
    const state = getField(fields, 'state');
    const lga = getField(fields, 'lga');
    const genderField = getField(fields, 'gender').toUpperCase();
    const gender: Gender | '' = genderField === 'MALE' || genderField === 'FEMALE' ? (genderField as Gender) : '';
    const sponsorName = getField(fields, 'sponsorName');
    const sponsorPhone = getField(fields, 'sponsorPhone');
    const sessionYear = getField(fields, 'sessionYear');
    const password = getField(fields, 'password');
    const confirmPassword = getField(fields, 'confirmPassword');

    // Basic validation
    if (!fullName || !regNo || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check for duplicates
    const exists = await prisma.student.findFirst({
      where: { OR: [{ email }, { regNo }] },
    });
    if (exists) {
      return res.status(409).json({ message: 'Email or RegNo already registered' });
    }

    // Handle optional profile photo
    let photoUrl: string | null = null;
    const profileFile = files.profilePhoto as File | File[] | undefined;
    if (profileFile) {
      const file = Array.isArray(profileFile) ? profileFile[0] : profileFile;
      if (file?.filepath) {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype || '')) {
          await fs.unlink(file.filepath).catch(() => {});
          return res.status(400).json({ message: 'Only JPEG or PNG images are allowed' });
        }
        const metadata = await sharp(file.filepath).metadata();
        if ((metadata.width ?? 0) > 4000 || (metadata.height ?? 0) > 4000) {
          await fs.unlink(file.filepath).catch(() => {});
          return res.status(400).json({ message: 'Image dimensions exceed 4000×4000 pixels' });
        }
        const fileName = `${Date.now()}_${file.originalFilename}`;
        const destPath = path.join(process.cwd(), 'public', 'uploads', fileName);
        await fs.rename(file.filepath, destPath);
        photoUrl = `/uploads/${fileName}`;
      }
    }

    // Save student
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.student.create({
      data: {
        fullName,
        regNo,
        phone,
        email,
        state,
        lga,
        gender: gender || null,
        sponsorName,
        sponsorPhone,
        sessionYear,
        passwordHash,
        profilePhoto: photoUrl,
      },
    });

    return res.status(201).json({ message: 'Registered' });
  } catch (err: unknown) {
    console.error('[/api/students] Registration error:', err);
    if (err instanceof Error && err.message.includes('maxFileSize')) {
      return res.status(413).json({ message: 'Uploaded file too large' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}

export default withLogging(handler, 'students.register');
