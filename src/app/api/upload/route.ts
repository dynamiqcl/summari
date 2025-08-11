import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const consultationId = formData.get('consultationId') as string
    const documentType = formData.get('documentType') as string || 'document'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido' },
        { status: 400 }
      )
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande (máximo 5MB)' },
        { status: 400 }
      )
    }

    // Generar nombre único
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    
    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', consultationId || 'general')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // El directorio ya existe
    }

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadsDir, uniqueFileName)
    
    await writeFile(filePath, buffer)

    // URL pública del archivo
    const fileUrl = `/uploads/${consultationId || 'general'}/${uniqueFileName}`

    // Información del documento
    const documentInfo = {
      id: uuidv4(),
      fileName: file.name,
      originalName: file.name,
      uniqueName: uniqueFileName,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      documentType,
      consultationId,
      uploadedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      document: documentInfo
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    )
  }
}
