import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/consultations/[id] - Actualizar consulta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { 
      symptoms, 
      diagnosis, 
      treatment, 
      prescription, 
      notes, 
      status,
      documents 
    } = body

    const consultation = await prisma.consultation.update({
      where: {
        id: id
      },
      data: {
        ...(symptoms && { symptoms }),
        ...(diagnosis && { diagnosis }),
        ...(treatment && { treatment }),
        ...(prescription && { prescription }),
        ...(notes && { notes }),
        ...(status && { status }),
        ...(documents && { documents: JSON.stringify(documents) })
      },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true
          }
        },
        doctor: true,
        medicalRecord: true
      }
    })

    // Si la consulta se completó, actualizar la cita
    if (status === 'COMPLETED') {
      await prisma.appointment.update({
        where: { id: consultation.appointmentId },
        data: { status: 'COMPLETED' }
      })
    }

    return NextResponse.json(consultation)
  } catch (error) {
    console.error('Error updating consultation:', error)
    return NextResponse.json(
      { error: 'Error updating consultation' },
      { status: 500 }
    )
  }
}
