import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/consultations - Obtener consultas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const doctorId = searchParams.get('doctorId')

    const where: any = {}
    
    if (appointmentId) {
      where.appointmentId = appointmentId
    }
    
    if (doctorId) {
      where.doctorId = doctorId
    }

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true
          }
        },
        doctor: true,
        medicalRecord: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(consultations)
  } catch (error) {
    console.error('Error fetching consultations:', error)
    return NextResponse.json(
      { error: 'Error fetching consultations' },
      { status: 500 }
    )
  }
}

// POST /api/consultations - Crear nueva consulta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      appointmentId, 
      doctorId, 
      symptoms, 
      diagnosis, 
      treatment, 
      prescription, 
      notes,
      medicalRecordId 
    } = body

    // Verificar si ya existe una consulta para esta cita
    const existingConsultation = await prisma.consultation.findUnique({
      where: { appointmentId },
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

    if (existingConsultation) {
      return NextResponse.json(existingConsultation)
    }

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId,
        doctorId,
        symptoms,
        diagnosis,
        treatment,
        prescription,
        notes,
        medicalRecordId,
        status: 'IN_PROGRESS'
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

    // Actualizar el estado de la cita
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'IN_PROGRESS' }
    })

    return NextResponse.json(consultation, { status: 201 })
  } catch (error) {
    console.error('Error creating consultation:', error)
    return NextResponse.json(
      { error: 'Error creating consultation' },
      { status: 500 }
    )
  }
}
