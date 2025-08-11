import { 
  User, 
  Appointment, 
  Consultation, 
  MedicalRecord,
  CreateAppointmentData,
  CreateConsultationData,
  UpdateConsultationData
} from '@/types/api'

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'

// Helper para manejar errores de API
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  return response.json()
}

// Users API
export const usersApi = {
  // Obtener todos los usuarios
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/api/users`)
    return handleResponse<User[]>(response)
  },

  // Obtener usuario por ID
  getById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`)
    return handleResponse<User>(response)
  },

  // Crear nuevo usuario
  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    return handleResponse<User>(response)
  }
}

// Appointments API
export const appointmentsApi = {
  // Obtener citas con filtros opcionales
  getAll: async (filters?: {
    doctorId?: string
    patientId?: string
    status?: string
  }): Promise<Appointment[]> => {
    const params = new URLSearchParams()
    if (filters?.doctorId) params.append('doctorId', filters.doctorId)
    if (filters?.patientId) params.append('patientId', filters.patientId)
    if (filters?.status) params.append('status', filters.status)
    
    const response = await fetch(`${API_BASE_URL}/api/appointments?${params}`)
    return handleResponse<Appointment[]>(response)
  },

  // Crear nueva cita
  create: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    })
    return handleResponse<Appointment>(response)
  },

  // Actualizar cita
  update: async (id: string, updateData: { status?: string; notes?: string }): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    return handleResponse<Appointment>(response)
  }
}

// Consultations API
export const consultationsApi = {
  // Obtener consultas con filtros opcionales
  getAll: async (filters?: {
    appointmentId?: string
    doctorId?: string
  }): Promise<Consultation[]> => {
    const params = new URLSearchParams()
    if (filters?.appointmentId) params.append('appointmentId', filters.appointmentId)
    if (filters?.doctorId) params.append('doctorId', filters.doctorId)
    
    const response = await fetch(`${API_BASE_URL}/api/consultations?${params}`)
    return handleResponse<Consultation[]>(response)
  },

  // Crear nueva consulta
  create: async (consultationData: CreateConsultationData): Promise<Consultation> => {
    const response = await fetch(`${API_BASE_URL}/api/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(consultationData)
    })
    return handleResponse<Consultation>(response)
  },

  // Actualizar consulta
  update: async (id: string, updateData: UpdateConsultationData): Promise<Consultation> => {
    const response = await fetch(`${API_BASE_URL}/api/consultations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    return handleResponse<Consultation>(response)
  }
}

// Medical Records API
export const medicalRecordsApi = {
  // Obtener historiales médicos por paciente
  getByPatient: async (patientId: string): Promise<MedicalRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/api/medical-records?patientId=${patientId}`)
    return handleResponse<MedicalRecord[]>(response)
  },

  // Obtener todos los historiales médicos
  getAll: async (): Promise<MedicalRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/api/medical-records`)
    return handleResponse<MedicalRecord[]>(response)
  }
}
