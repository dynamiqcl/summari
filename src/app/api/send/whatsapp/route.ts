import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/send/whatsapp - Enviar documentos por WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { consultationId, patientPhone, documents } = body

    if (!consultationId || !patientPhone) {
      return NextResponse.json(
        { error: 'consultationId y patientPhone son requeridos' },
        { status: 400 }
      )
    }

    // Obtener información de la consulta
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true
          }
        }
      }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // En un entorno real, aquí integrarías con WhatsApp Business API:
    // - Twilio WhatsApp API
    // - Meta WhatsApp Business API
    // - WhatsApp Cloud API
    
    // Simular envío por WhatsApp
    const whatsappData = {
      to: patientPhone,
      message: `
🏥 *Summari - Documentos de Consulta*

Hola ${consultation.appointment.patient.name},

Sus documentos de la consulta con ${consultation.appointment.doctor.name} están listos.

📅 *Fecha:* ${new Date(consultation.date).toLocaleDateString('es-ES')}
${consultation.diagnosis ? `🩺 *Diagnóstico:* ${consultation.diagnosis}` : ''}
${consultation.treatment ? `💊 *Tratamiento:* ${consultation.treatment}` : ''}
${consultation.prescription ? `📝 *Prescripción:* ${consultation.prescription}` : ''}

📎 *Documentos adjuntos:* ${documents?.length || 0}

Para descargar sus documentos, visite: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents/${consultationId}

¿Preguntas? Responda a este mensaje.

_Equipo Médico Summari_
      `,
      documents: documents || []
    }

    // Simular envío exitoso
    console.log('📱 WhatsApp simulado enviado:', whatsappData)

    // Actualizar consulta con información de envío
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mensaje de WhatsApp enviado exitosamente',
      sentAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error sending WhatsApp:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje de WhatsApp' },
      { status: 500 }
    )
  }
}
