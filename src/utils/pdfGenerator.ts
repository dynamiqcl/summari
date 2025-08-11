import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MedicalDocumentData {
  patientName: string;
  doctorName: string;
  date: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  recommendations?: string;
  followUp?: string;
  observations?: string;
}

export class PDFGenerator {
  private static formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Generar Informe Médico
  static generateMedicalReport(data: MedicalDocumentData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME MÉDICO', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    
    // Información del paciente y doctor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Paciente: ${data.patientName}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Médico: Dr. ${data.doctorName}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Fecha: ${this.formatDate(data.date)}`, margin, yPosition);
    yPosition += 20;

    // Síntomas
    if (data.symptoms) {
      doc.setFont('helvetica', 'bold');
      doc.text('SÍNTOMAS PRESENTADOS:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const symptomsLines = doc.splitTextToSize(data.symptoms, pageWidth - 2 * margin);
      doc.text(symptomsLines, margin, yPosition);
      yPosition += symptomsLines.length * 5 + 10;
    }

    // Observaciones
    if (data.observations) {
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVACIONES CLÍNICAS:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const observationsLines = doc.splitTextToSize(data.observations, pageWidth - 2 * margin);
      doc.text(observationsLines, margin, yPosition);
      yPosition += observationsLines.length * 5 + 10;
    }

    // Diagnóstico
    if (data.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNÓSTICO:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(data.diagnosis, pageWidth - 2 * margin);
      doc.text(diagnosisLines, margin, yPosition);
      yPosition += diagnosisLines.length * 5 + 10;
    }

    // Tratamiento
    if (data.treatment) {
      doc.setFont('helvetica', 'bold');
      doc.text('TRATAMIENTO RECOMENDADO:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const treatmentLines = doc.splitTextToSize(data.treatment, pageWidth - 2 * margin);
      doc.text(treatmentLines, margin, yPosition);
      yPosition += treatmentLines.length * 5 + 15;
    }

    // Firma
    yPosition = Math.max(yPosition, 250);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________________', pageWidth - margin - 60, yPosition);
    yPosition += 10;
    doc.text(`Dr. ${data.doctorName}`, pageWidth - margin - 60, yPosition);
    yPosition += 5;
    doc.setFontSize(8);
    doc.text('Firma del Médico', pageWidth - margin - 60, yPosition);

    return doc;
  }

  // Generar Receta Médica
  static generatePrescription(data: MedicalDocumentData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RECETA MÉDICA', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 25;
    
    // Información del paciente y doctor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Paciente: ${data.patientName}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Médico: Dr. ${data.doctorName}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Fecha: ${this.formatDate(data.date)}`, margin, yPosition);
    yPosition += 25;

    // Prescripción
    if (data.prescription) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('MEDICAMENTOS PRESCRITOS:', margin, yPosition);
      yPosition += 15;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      const prescriptionLines = doc.splitTextToSize(data.prescription, pageWidth - 2 * margin);
      doc.text(prescriptionLines, margin, yPosition);
      yPosition += prescriptionLines.length * 6 + 20;
    }

    // Diagnóstico (para contexto)
    if (data.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNÓSTICO:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(data.diagnosis, pageWidth - 2 * margin);
      doc.text(diagnosisLines, margin, yPosition);
      yPosition += diagnosisLines.length * 5 + 20;
    }

    // Indicaciones especiales
    if (data.recommendations) {
      doc.setFont('helvetica', 'bold');
      doc.text('INDICACIONES ESPECIALES:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const recommendationsLines = doc.splitTextToSize(data.recommendations, pageWidth - 2 * margin);
      doc.text(recommendationsLines, margin, yPosition);
      yPosition += recommendationsLines.length * 5 + 20;
    }

    // Firma
    yPosition = Math.max(yPosition, 240);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________________', pageWidth - margin - 60, yPosition);
    yPosition += 10;
    doc.text(`Dr. ${data.doctorName}`, pageWidth - margin - 60, yPosition);
    yPosition += 5;
    doc.setFontSize(8);
    doc.text('Firma del Médico', pageWidth - margin - 60, yPosition);

    return doc;
  }

  // Generar Indicaciones Médicas
  static generateInstructions(data: MedicalDocumentData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INDICACIONES MÉDICAS', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 25;
    
    // Información del paciente y doctor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Paciente: ${data.patientName}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Médico: Dr. ${data.doctorName}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Fecha: ${this.formatDate(data.date)}`, margin, yPosition);
    yPosition += 25;

    // Recomendaciones
    if (data.recommendations) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('RECOMENDACIONES GENERALES:', margin, yPosition);
      yPosition += 15;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      const recommendationsLines = doc.splitTextToSize(data.recommendations, pageWidth - 2 * margin);
      doc.text(recommendationsLines, margin, yPosition);
      yPosition += recommendationsLines.length * 6 + 15;
    }

    // Tratamiento
    if (data.treatment) {
      doc.setFont('helvetica', 'bold');
      doc.text('TRATAMIENTO A SEGUIR:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const treatmentLines = doc.splitTextToSize(data.treatment, pageWidth - 2 * margin);
      doc.text(treatmentLines, margin, yPosition);
      yPosition += treatmentLines.length * 5 + 15;
    }

    // Seguimiento
    if (data.followUp) {
      doc.setFont('helvetica', 'bold');
      doc.text('SEGUIMIENTO:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      const followUpLines = doc.splitTextToSize(data.followUp, pageWidth - 2 * margin);
      doc.text(followUpLines, margin, yPosition);
      yPosition += followUpLines.length * 5 + 20;
    }

    // Firma
    yPosition = Math.max(yPosition, 240);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________________', pageWidth - margin - 60, yPosition);
    yPosition += 10;
    doc.text(`Dr. ${data.doctorName}`, pageWidth - margin - 60, yPosition);
    yPosition += 5;
    doc.setFontSize(8);
    doc.text('Firma del Médico', pageWidth - margin - 60, yPosition);

    return doc;
  }

  // Generar todos los documentos como un ZIP
  static async generateAllDocuments(data: MedicalDocumentData): Promise<{
    report: Blob;
    prescription: Blob;
    instructions: Blob;
  }> {
    const report = this.generateMedicalReport(data);
    const prescription = this.generatePrescription(data);
    const instructions = this.generateInstructions(data);

    return {
      report: report.output('blob'),
      prescription: prescription.output('blob'),
      instructions: instructions.output('blob')
    };
  }
}

export default PDFGenerator;
