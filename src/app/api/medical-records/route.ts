import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/medical-records - Obtener historiales médicos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    const where: any = {}
    
    if (patientId) {
      where.patientId = patientId
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: true,
        consultations: {
          include: {
            doctor: true,
            appointment: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(medicalRecords)
  } catch (error) {
    console.error('Error fetching medical records:', error)
    return NextResponse.json(
      { error: 'Error fetching medical records' },
      { status: 500 }
    )
  }
}
