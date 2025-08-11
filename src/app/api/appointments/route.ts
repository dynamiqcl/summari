import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/appointments - Obtener todas las citas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (doctorId) {
      where.doctorId = doctorId
    }
    
    if (patientId) {
      where.patientId = patientId
    }
    
    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: true,
        patient: true,
        consultation: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Error fetching appointments' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Crear nueva cita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doctorId, patientId, date, notes } = body

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        date: new Date(date),
        notes,
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
    return NextResponse.json(
      { error: 'Error creating appointment' },
      { status: 500 }
    )
  }
}
