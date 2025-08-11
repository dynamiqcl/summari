import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle, Eye, Download, Trash2 } from 'lucide-react'
import { Document } from '@/types/api'
import { formatFileSize, getFileTypeIcon, isValidFileType } from '@/types/helpers'

interface DocumentUploadProps {
  consultationId: string
  onDocumentsUpdate?: (documents: Document[]) => void
}

interface UploadedFile {
  file: File
  id: string
  preview?: string
}

export default function DocumentUpload({ consultationId, onDocumentsUpdate }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [savedDocuments, setSavedDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar documentos existentes al montar el componente
  React.useEffect(() => {
    loadExistingDocuments()
  }, [consultationId])

  const loadExistingDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?consultationId=${consultationId}`)
      if (response.ok) {
        const documents = await response.json()
        setSavedDocuments(documents)
        onDocumentsUpdate?.(documents)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const validateFile = (file: File): string | null => {
    if (!isValidFileType(file.type)) {
      return 'Tipo de archivo no permitido'
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return 'El archivo es demasiado grande (máximo 5MB)'
    }
    return null
  }

  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined)
      }
    })
  }

  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = []
    const newErrors: { [key: string]: string } = {}

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileId = `${Date.now()}-${i}`
      
      const error = validateFile(file)
      if (error) {
        newErrors[fileId] = error
        continue
      }

      const preview = await generatePreview(file)
      
      newFiles.push({
        file,
        id: fileId,
        preview
      })
    }

    setFiles(prev => [...prev, ...newFiles])
    setErrors(prev => ({ ...prev, ...newErrors }))
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fileId]
      return newErrors
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    const uploadPromises = files.map(async (fileData) => {
      try {
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 0 }))
        
        const formData = new FormData()
        formData.append('file', fileData.file)
        formData.append('consultationId', consultationId)
        formData.append('documentType', getDocumentType(fileData.file))

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Error uploading file')
        }

        const result = await response.json()
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 100 }))
        
        return result
      } catch (error) {
        console.error('Error uploading file:', error)
        setErrors(prev => ({ ...prev, [fileData.id]: 'Error al subir el archivo' }))
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(result => result !== null)
    
    if (successfulUploads.length > 0) {
      await loadExistingDocuments() // Recargar documentos
      setFiles([]) // Limpiar archivos pendientes
      setUploadProgress({})
    }
    
    setUploading(false)
  }

  const getDocumentType = (file: File): string => {
    if (file.type.includes('pdf')) return 'PDF'
    if (file.type.includes('image')) return 'Imagen'
    if (file.type.includes('word') || file.type.includes('doc')) return 'Documento'
    return 'Archivo'
  }

  const downloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(doc.fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.originalName
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const deleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadExistingDocuments()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg">
        <div
          className={`p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Subir Documentos de la Consulta
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Formatos soportados: PDF, DOC, DOCX, TXT, JPG, PNG (máximo 5MB)
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Seleccionar Archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Archivos pendientes de subir */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Archivos pendientes ({files.length})</h4>
          {files.map((fileData) => (
            <div key={fileData.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {fileData.preview ? (
                  <img src={fileData.preview} alt="" className="w-10 h-10 object-cover rounded" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-lg">{getFileTypeIcon(fileData.file.type)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileData.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileData.file.size)}
                </p>
                {uploadProgress[fileData.id] !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all"
                      style={{ width: `${uploadProgress[fileData.id]}%` }}
                    />
                  </div>
                )}
                {errors[fileData.id] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors[fileData.id]}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeFile(fileData.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setFiles([])}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpiar Todo
            </button>
            <button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Subiendo...
                </>
              ) : (
                'Subir Archivos'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Documentos guardados */}
      {savedDocuments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Documentos de la consulta ({savedDocuments.length})</h4>
          {savedDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-lg">{getFileTypeIcon(doc.fileType)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.originalName}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{doc.documentType}</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadDocument(doc)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedDocuments.length === 0 && files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay documentos asociados a esta consulta</p>
        </div>
      )}
    </div>
  )
}
