import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDFGenerator } from '@/utils/pdfGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consultationId, documentType } = body;

    if (!consultationId || !documentType) {
      return NextResponse.json(
        { error: 'Consultation ID and document type are required' },
        { status: 400 }
      );
    }

    // Obtener datos de la consulta
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
    });

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }

    const documentData = {
      patientName: consultation.appointment.patient.name,
      doctorName: consultation.appointment.doctor.name,
      date: consultation.createdAt.toISOString(),
      symptoms: consultation.symptoms || '',
      diagnosis: consultation.diagnosis || '',
      treatment: consultation.treatment || '',
      prescription: consultation.prescription || '',
      recommendations: consultation.notes || '', // Usando notes como recommendations
      followUp: consultation.followUpDate?.toISOString() || '',
      observations: consultation.symptoms || '' // Usando symptoms como observations
    };

    let pdf;
    let filename;

    switch (documentType) {
      case 'report':
        pdf = PDFGenerator.generateMedicalReport(documentData);
        filename = `informe_medico_${consultation.appointment.patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        break;
      case 'prescription':
        pdf = PDFGenerator.generatePrescription(documentData);
        filename = `receta_medica_${consultation.appointment.patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        break;
      case 'instructions':
        pdf = PDFGenerator.generateInstructions(documentData);
        filename = `indicaciones_${consultation.appointment.patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid document type. Use: report, prescription, or instructions' },
          { status: 400 }
        );
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const consultationId = url.searchParams.get('consultationId');
    
    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      );
    }

    // Obtener datos de la consulta para verificar que existe
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
    });

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }

    const documentData = {
      patientName: consultation.appointment.patient.name,
      doctorName: consultation.appointment.doctor.name,
      date: consultation.createdAt.toISOString(),
      symptoms: consultation.symptoms || '',
      diagnosis: consultation.diagnosis || '',
      treatment: consultation.treatment || '',
      prescription: consultation.prescription || '',
      recommendations: consultation.notes || '',
      followUp: consultation.followUpDate?.toISOString() || '',
      observations: consultation.symptoms || ''
    };

    // Generar todos los documentos
    const documents = await PDFGenerator.generateAllDocuments(documentData);
    
    return NextResponse.json({
      message: 'Documents available for generation',
      patientName: consultation.appointment.patient.name,
      doctorName: consultation.appointment.doctor.name,
      availableDocuments: ['report', 'prescription', 'instructions'],
      hasData: {
        symptoms: !!consultation.symptoms,
        diagnosis: !!consultation.diagnosis,
        treatment: !!consultation.treatment,
        prescription: !!consultation.prescription,
        notes: !!consultation.notes
      }
    });

  } catch (error) {
    console.error('Error checking consultation:', error);
    return NextResponse.json(
      { error: 'Failed to check consultation' },
      { status: 500 }
    );
  }
}
