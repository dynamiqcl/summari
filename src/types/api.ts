// Tipos para la API
export interface User {
  id: string
  name: string
  email: string
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN'
  createdAt: string
  updatedAt: string
  doctorAppointments?: Appointment[]
  patientAppointments?: Appointment[]
  medicalRecords?: MedicalRecord[]
}

export interface Appointment {
  id: string
  date: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  createdAt: string
  updatedAt: string
  doctorId: string
  doctor: User
  patientId: string
  patient: User
  consultation?: Consultation
}

export interface MedicalRecord {
  id: string
  diagnosis: string
  treatment: string
  medications?: string
  allergies?: string
  notes?: string
  createdAt: string
  updatedAt: string
  patientId: string
  patient: User
  consultations?: Consultation[]
}

export interface Document {
  id: string
  fileName: string
  originalName: string
  uniqueName: string
  fileUrl: string
  fileType: string
  fileSize: number
  documentType: string
  consultationId?: string
  uploadedAt: string
}

export interface Consultation {
  id: string
  date: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  prescription?: string
  notes?: string
  documents?: string // JSON string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  appointmentId: string
  appointment: Appointment
  doctorId: string
  doctor: User
  medicalRecordId?: string
  medicalRecord?: MedicalRecord
}

// Tipos para formularios
export interface CreateAppointmentData {
  doctorId: string
  patientId: string
  date: string
  notes?: string
}

export interface CreateConsultationData {
  appointmentId: string
  doctorId: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  prescription?: string
  notes?: string
  medicalRecordId?: string
}

export interface UpdateConsultationData {
  symptoms?: string
  diagnosis?: string
  treatment?: string
  prescription?: string
  notes?: string
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  documents?: string[]
}

export interface SendDocumentsData {
  consultationId: string
  method: 'email' | 'whatsapp'
  destination: string // email or phone
  documents: Document[]
}

// Tipos para dashboard administrativo
export interface Analytics {
  id: string
  date: string
  totalConsultations: number
  completedConsultations: number
  cancelledConsultations: number
  averageDuration: number
  totalRevenue: number
  activeUsers: number
  createdAt: string
}

export interface AnalyticsSummary {
  totalConsultations: number
  completedConsultations: number
  cancelledConsultations: number
  totalRevenue: number
  averageDuration: number
  activeUsers: number
  completionRate: number
  cancellationRate: number
}

export interface SystemSettings {
  id: string
  consultationPrice: number
  currency: string
  timeZone: string
  maxConsultationDuration: number
  allowCancellation: boolean
  cancellationDeadline: number
  createdAt: string
  updatedAt: string
}
