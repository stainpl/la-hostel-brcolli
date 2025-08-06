import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';  
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { token, password, confirm } = await request.json();

  if (!token || !password || password !== confirm) {
    return NextResponse.json(
      { error: 'Missing reset token or mismatched passwords' },
      { status: 400 }
    );
  }

  
  const reset = await prisma.studentReset.findUnique({
    where: { token },
  });

  if (!reset || reset.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Invalid or expired reset token.' },
      { status: 400 }
    );
  }

  // Hash the new password
  const hash = await bcrypt.hash(password, 10);

  // ✅ Update student
  await prisma.student.update({
    where: { id: reset.studentId },
    data: { passwordHash: hash },
  });

  // ✅ Delete reset token
  await prisma.studentReset.delete({
    where: { id: reset.id },
  });

  return NextResponse.json({
    success: true,
    message: 'Password reset successfully.',
  });
}
