import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession }            from 'next-auth'
import { authOptions }                 from '@/pages/api/auth/[...nextauth]'
import { prisma }                      from '@/lib/prisma'


export async function GET(_req: NextRequest) {
  // 1) Fetch rooms + students
  const roomsRaw = await prisma.room.findMany({
    include: {
      students: {
        select: { id: true, name: true, hasPaid: true }
      }
    },
    orderBy: { block: 'asc' }
  })

  // 2) Fix: wrap in backticks for interpolation

   const rooms = roomsRaw.map((r: {
  id: number
  block: string
  number: number
  price: number
  gender: 'MALE' | 'FEMALE'
  students: { hasPaid: boolean }[]
}) => ({
  id:            r.id,
  label:         `${r.block}-${r.number}`,
  block:         r.block,
  number:        r.number,
  price:         r.price,
  gender:        r.gender,
  totalStudents: r.students.length,
  paidCount:     r.students.filter((s) => s.hasPaid).length,
  students:      r.students,
}))
  return NextResponse.json(rooms)
}

export async function POST(req: NextRequest) {
  // Auth (you may need to pass req into getServerSession depending on your NextAuth version)
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { block, number, price, gender } = await req.json()
  if (!block || !number || !price || !gender) {
    return NextResponse.json({ message: 'All fields required' }, { status: 400 })
  }

  try {
    const room = await prisma.room.create({
      data: {
        block:  block.toUpperCase(),
        number: Number(number),
        price:  Number(price),
        gender,
      },
    })
    return NextResponse.json(room, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json(
        { message: `Room ${block.toUpperCase()}-${number} for ${gender.toLowerCase()} already exists.` },
        { status: 409 }
      )
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
