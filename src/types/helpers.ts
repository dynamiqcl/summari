// Helper para formatear fechas
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper para obtener color de estado
export const getStatusColor = (status: string): string => {
  const colors = {
    'SCHEDULED': 'text-blue-600 bg-blue-50',
    'IN_PROGRESS': 'text-yellow-600 bg-yellow-50',
    'COMPLETED': 'text-green-600 bg-green-50',
    'CANCELLED': 'text-red-600 bg-red-50'
  }
  return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
}

// Helper para formatear tamaño de archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper para obtener icono de tipo de archivo
export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('image')) return '🖼️'
  if (fileType.includes('word') || fileType.includes('doc')) return '📝'
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊'
  return '📁'
}

// Helper para validar tipos de archivo permitidos
export const isValidFileType = (fileType: string): boolean => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  return allowedTypes.includes(fileType)
}
