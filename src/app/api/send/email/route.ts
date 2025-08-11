import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/send/email - Enviar documentos por email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { consultationId, patientEmail, documents } = body

    if (!consultationId || !patientEmail) {
      return NextResponse.json(
        { error: 'consultationId y patientEmail son requeridos' },
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

    // En un entorno real, aquí integrarías con un servicio de email como:
    // - Nodemailer
    // - SendGrid
    // - Amazon SES
    // - Resend
    
    // Por ahora, simulamos el envío
    const emailData = {
      to: patientEmail,
      subject: `Documentos de consulta médica - ${consultation.appointment.doctor.name}`,
      body: `
        Estimado/a ${consultation.appointment.patient.name},

        Adjunto encontrará los documentos de su consulta médica realizada el ${new Date(consultation.date).toLocaleDateString('es-ES')}.

        Detalles de la consulta:
        - Médico: ${consultation.appointment.doctor.name}
        - Fecha: ${new Date(consultation.date).toLocaleDateString('es-ES')}
        - Diagnóstico: ${consultation.diagnosis || 'No especificado'}
        - Tratamiento: ${consultation.treatment || 'No especificado'}
        
        ${consultation.prescription ? `Prescripción: ${consultation.prescription}` : ''}
        ${consultation.notes ? `Notas adicionales: ${consultation.notes}` : ''}

        Documentos adjuntos: ${documents?.length || 0}

        Para cualquier consulta, no dude en contactarnos.

        Saludos cordiales,
        Equipo Médico Summari
      `,
      documents: documents || []
    }

    // Simular envío exitoso
    console.log('📧 Email simulado enviado:', emailData)

    // Actualizar consulta con información de envío
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente',
      sentAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Error al enviar email' },
      { status: 500 }
    )
  }
}
