'use client';

import React, { useState } from 'react';
import { Download, FileText, Pill, ClipboardList, Loader } from 'lucide-react';

interface PDFGeneratorProps {
  consultationId: string;
  patientName: string;
  className?: string;
}

interface DocumentStatus {
  symptoms: boolean;
  diagnosis: boolean;
  treatment: boolean;
  prescription: boolean;
  notes: boolean;
}

const PDFGeneratorComponent: React.FC<PDFGeneratorProps> = ({
  consultationId,
  patientName,
  className = ''
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);

  const checkDocumentStatus = async () => {
    try {
      const response = await fetch(`/api/generate-pdf?consultationId=${consultationId}`);
      const data = await response.json();
      
      if (response.ok) {
        setDocumentStatus(data.hasData);
        return data.hasData;
      }
      return null;
    } catch (error) {
      console.error('Error checking document status:', error);
      return null;
    }
  };

  const downloadPDF = async (documentType: 'report' | 'prescription' | 'instructions') => {
    setLoading(documentType);
    
    try {
      // Verificar estado de los documentos si no lo hemos hecho
      if (!documentStatus) {
        await checkDocumentStatus();
      }

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId,
          documentType
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      // Obtener el blob del PDF
      const blob = await response.blob();
      
      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = '';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        filename = filenameMatch ? filenameMatch[1] : `documento_${documentType}.pdf`;
      } else {
        filename = `documento_${documentType}.pdf`;
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setLoading(null);
    }
  };

  const downloadAllDocuments = async () => {
    if (!documentStatus) {
      await checkDocumentStatus();
    }

    // Descargar todos los documentos secuencialmente
    const documents: Array<'report' | 'prescription' | 'instructions'> = [
      'report',
      'prescription', 
      'instructions'
    ];

    for (const docType of documents) {
      await downloadPDF(docType);
      // Pequeña pausa entre descargas
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  React.useEffect(() => {
    if (consultationId) {
      checkDocumentStatus();
    }
  }, [consultationId]);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <FileText className="w-5 h-5" />;
      case 'prescription':
        return <Pill className="w-5 h-5" />;
      case 'instructions':
        return <ClipboardList className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'report':
        return 'Informe Médico';
      case 'prescription':
        return 'Receta Médica';
      case 'instructions':
        return 'Indicaciones';
      default:
        return 'Documento';
    }
  };

  const canGenerateDocument = (type: string) => {
    if (!documentStatus) return true; // Permitir si no sabemos el estado
    
    switch (type) {
      case 'report':
        return documentStatus.symptoms || documentStatus.diagnosis;
      case 'prescription':
        return documentStatus.prescription;
      case 'instructions':
        return documentStatus.treatment || documentStatus.notes;
      default:
        return true;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Generar Documentos PDF
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Paciente: <span className="font-medium">{patientName}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {['report', 'prescription', 'instructions'].map((docType) => (
            <button
              key={docType}
              onClick={() => downloadPDF(docType as any)}
              disabled={loading === docType || !canGenerateDocument(docType)}
              className={`
                flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors text-sm font-medium
                ${canGenerateDocument(docType)
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                }
                ${loading === docType ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading === docType ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                getDocumentIcon(docType)
              )}
              {getDocumentTitle(docType)}
            </button>
          ))}
        </div>

        <button
          onClick={downloadAllDocuments}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          Descargar Todos los Documentos
        </button>

        {documentStatus && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Estado de la información:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1 ${documentStatus.symptoms ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${documentStatus.symptoms ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                Síntomas
              </div>
              <div className={`flex items-center gap-1 ${documentStatus.diagnosis ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${documentStatus.diagnosis ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                Diagnóstico
              </div>
              <div className={`flex items-center gap-1 ${documentStatus.treatment ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${documentStatus.treatment ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                Tratamiento
              </div>
              <div className={`flex items-center gap-1 ${documentStatus.prescription ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${documentStatus.prescription ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                Receta
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFGeneratorComponent;
