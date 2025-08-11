import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!settings) {
      // Crear configuración por defecto si no existe
      const defaultSettings = await prisma.systemSettings.create({
        data: {
          consultationPrice: 50.0,
          currency: 'USD',
          timeZone: 'America/New_York',
          maxConsultationDuration: 60,
          allowCancellation: true,
          cancellationDeadline: 24
        }
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      consultationPrice, 
      currency, 
      timeZone, 
      maxConsultationDuration, 
      allowCancellation, 
      cancellationDeadline 
    } = body

    const settings = await prisma.systemSettings.create({
      data: {
        consultationPrice: parseFloat(consultationPrice),
        currency,
        timeZone,
        maxConsultationDuration: parseInt(maxConsultationDuration),
        allowCancellation: Boolean(allowCancellation),
        cancellationDeadline: parseInt(cancellationDeadline)
      }
    })

    return NextResponse.json(settings, { status: 201 })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
