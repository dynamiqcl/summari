import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/appointments/[id] - Actualizar cita
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body

    const appointment = await prisma.appointment.update({
      where: {
        id: params.id
      },
      data: {
        ...(status && { status }),
        ...(notes && { notes })
      },
      include: {
        doctor: true,
        patient: true,
        consultation: true
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Error updating appointment' },
      { status: 500 }
    )
  }
}
