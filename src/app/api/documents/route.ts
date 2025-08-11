import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/documents - Obtener documentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consultationId = searchParams.get('consultationId')

    if (!consultationId) {
      return NextResponse.json(
        { error: 'consultationId es requerido' },
        { status: 400 }
      )
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { documents: true }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    const documents = consultation.documents 
      ? JSON.parse(consultation.documents) 
      : []

    return NextResponse.json({ documents })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Asociar documento con consulta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { consultationId, document } = body

    if (!consultationId || !document) {
      return NextResponse.json(
        { error: 'consultationId y document son requeridos' },
        { status: 400 }
      )
    }

    // Obtener documentos actuales
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { documents: true }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    const currentDocuments = consultation.documents 
      ? JSON.parse(consultation.documents) 
      : []

    // Agregar nuevo documento
    const updatedDocuments = [...currentDocuments, document]

    // Actualizar consulta
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        documents: JSON.stringify(updatedDocuments)
      },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      consultation: updatedConsultation,
      documents: updatedDocuments
    })

  } catch (error) {
    console.error('Error adding document:', error)
    return NextResponse.json(
      { error: 'Error al agregar documento' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents - Eliminar documento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consultationId = searchParams.get('consultationId')
    const documentId = searchParams.get('documentId')

    if (!consultationId || !documentId) {
      return NextResponse.json(
        { error: 'consultationId y documentId son requeridos' },
        { status: 400 }
      )
    }

    // Obtener documentos actuales
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { documents: true }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    const currentDocuments = consultation.documents 
      ? JSON.parse(consultation.documents) 
      : []

    // Filtrar documento a eliminar
    const updatedDocuments = currentDocuments.filter(
      (doc: any) => doc.id !== documentId
    )

    // Actualizar consulta
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        documents: JSON.stringify(updatedDocuments)
      }
    })

    return NextResponse.json({
      success: true,
      documents: updatedDocuments
    })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    )
  }
}
