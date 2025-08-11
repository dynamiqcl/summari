import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: true,
        patient: true,
        consultation: true
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doctorId, patientId, date, notes } = body

    if (!doctorId || !patientId || !date) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        date: new Date(date),
        notes: notes || '',
        status: 'SCHEDULED'
      },
      include: {
        doctor: true,
        patient: true
      }
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
