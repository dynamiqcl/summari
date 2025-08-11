'use client'

import { useState, useEffect } from 'react'
import { Calendar, User, Video, FileText, Send, ArrowLeft, ArrowRight, Check, Clock, MapPin, Mail, MessageCircle, Upload, Download, Paperclip, X, BarChart3, Users, Settings, Plus, TrendingUp, DollarSign, Activity, UserPlus } from 'lucide-react'
import { User as UserType, Appointment, Consultation, MedicalRecord, Document } from '@/types/api'
import { formatDate, getStatusColor } from '@/types/helpers'
import DocumentUpload from '@/components/DocumentUpload'
import PDFGenerator from '@/components/PDFGenerator'

// Enum para los pasos del flujo
enum Step {
  USER_SELECTION = 0,
  ADMIN_DASHBOARD = 1,
  DOCTOR_AGENDA = 2,
  PATIENT_SELECTION = 3,
  PATIENT_INFO = 4,
  VIDEO_CONSULTATION = 5,
  MEDICAL_NOTES = 6,
  DOCUMENTS = 7,
  SEND_DOCUMENTS = 8
}

export default function SummariPlatform() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.USER_SELECTION)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [consultationDocuments, setConsultationDocuments] = useState<Document[]>([])
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp'>('email')
  const [sendDestination, setSendDestination] = useState('')
  
  // Estados para anotaciones médicas
  const [medicalNotes, setMedicalNotes] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    recommendations: '',
    followUp: '',
    additionalNotes: ''
  })
  
  // Estados para chat del paciente
  const [chatMessages, setChatMessages] = useState<Array<{id: string, message: string, timestamp: Date, sender: 'patient' | 'doctor'}>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [patientFiles, setPatientFiles] = useState<Array<{id: string, name: string, size: number, type: string, file: File, uploaded: boolean}>>([])
  
  // Estados para cargar datos
  const [users, setUsers] = useState<UserType[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Estados para dashboard administrativo
  const [analytics, setAnalytics] = useState<any>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [systemSettings, setSystemSettings] = useState<any>(null)
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [showCreateAppointmentForm, setShowCreateAppointmentForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'PATIENT' })
  const [newAppointment, setNewAppointment] = useState({ doctorId: '', patientId: '', date: '', notes: '' })

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchDoctorAppointments = async (doctorId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointments?doctorId=${doctorId}`)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientMedicalRecords = async (patientId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/medical-records?patientId=${patientId}`)
      const data = await response.json()
      setMedicalRecords(data)
    } catch (error) {
      console.error('Error fetching medical records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConsultationDocuments = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/documents?consultationId=${consultationId}`)
      const data = await response.json()
      setConsultationDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const fetchPatientAppointments = async (patientId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointments?patientId=${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching patient appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const startConsultation = async (appointmentId: string) => {
    try {
      setLoading(true)
      
      // Obtener el doctor ID dependiendo del contexto
      let doctorId = selectedDoctor?.id;
      
      // Si no hay doctor seleccionado (usuario paciente), obtenerlo de la cita
      if (!doctorId && selectedAppointment) {
        doctorId = selectedAppointment.doctor.id;
        // Asegurar que el doctor esté configurado para la consulta
        setSelectedDoctor(selectedAppointment.doctor);
      }
      
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          doctorId: doctorId,
          symptoms: 'Síntomas reportados durante la teleconsulta',
          notes: 'Consulta iniciada desde la plataforma Summari'
        })
      })
      
      if (response.ok) {
        const newConsultation = await response.json()
        setConsultation(newConsultation)
        setCurrentStep(Step.VIDEO_CONSULTATION)
      } else {
        console.error('Error creating consultation:', await response.text())
        alert('Error al iniciar la consulta. Por favor, intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error starting consultation:', error)
      alert('Error al iniciar la consulta. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const completeConsultation = async () => {
    if (!consultation) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/consultations/${consultation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          diagnosis: 'Diagnóstico completado durante teleconsulta',
          treatment: 'Tratamiento recomendado',
          prescription: 'Medicamentos recetados'
        })
      })
      
      if (response.ok) {
        const updatedConsultation = await response.json()
        setConsultation(updatedConsultation)
        // Cargar datos existentes en el formulario si existen
        setMedicalNotes({
          symptoms: updatedConsultation.symptoms || '',
          diagnosis: updatedConsultation.diagnosis || '',
          treatment: updatedConsultation.treatment || '',
          prescription: updatedConsultation.prescription || '',
          recommendations: '',
          followUp: '',
          additionalNotes: updatedConsultation.notes || ''
        })
        setCurrentStep(Step.MEDICAL_NOTES)
      }
    } catch (error) {
      console.error('Error completing consultation:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveMedicalNotes = async () => {
    if (!consultation) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/consultations/${consultation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: medicalNotes.symptoms,
          diagnosis: medicalNotes.diagnosis,
          treatment: medicalNotes.treatment,
          prescription: medicalNotes.prescription,
          notes: `${medicalNotes.additionalNotes}\n\nRecomendaciones: ${medicalNotes.recommendations}\nSeguimiento: ${medicalNotes.followUp}`.trim()
        })
      })
      
      if (response.ok) {
        const updatedConsultation = await response.json()
        setConsultation(updatedConsultation)
        fetchConsultationDocuments(updatedConsultation.id)
        setCurrentStep(Step.DOCUMENTS)
      }
    } catch (error) {
      console.error('Error saving medical notes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para enviar mensajes del chat
  const sendChatMessage = () => {
    if (!currentMessage.trim()) return
    
    const newMessage = {
      id: Date.now().toString(),
      message: currentMessage,
      timestamp: new Date(),
      sender: (selectedUser?.role === 'DOCTOR' ? 'doctor' : 'patient') as 'doctor' | 'patient'
    }
    
    setChatMessages(prev => [...prev, newMessage])
    setCurrentMessage('')
    
    // Aquí se podría enviar el mensaje al servidor
    console.log('Mensaje enviado:', newMessage)
  }

  // Función para manejar subida de archivos del paciente
  const handlePatientFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    
    Array.from(files).forEach(async file => {
      // Validar tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 5MB.`)
        return
      }
      
      const newFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploaded: false
      }
      
      setPatientFiles(prev => [...prev, newFile])
      
      // Subir automáticamente el archivo
      setTimeout(() => {
        uploadPatientFile(newFile.id)
      }, 500) // Pequeño delay para que se vea en la UI
    })
    
    // Limpiar el input
    event.target.value = ''
  }

  // Función para subir archivo del paciente al servidor
  const uploadPatientFile = async (fileId: string) => {
    const file = patientFiles.find(f => f.id === fileId)
    if (!file || !consultation) return
    
    try {
      // Simular subida (aquí se implementaría la subida real)
      console.log('Subiendo archivo:', file.name)
      
      // Actualizar estado del archivo
      setPatientFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, uploaded: true } : f
      ))
      
      // Aquí se implementaría la subida real al servidor
      // const formData = new FormData()
      // formData.append('file', file.file)
      // formData.append('consultationId', consultation.id)
      // await fetch('/api/upload-patient-file', { method: 'POST', body: formData })
      
    } catch (error) {
      console.error('Error subiendo archivo:', error)
      alert('Error al subir el archivo')
    }
  }

  // Funciones para dashboard administrativo
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics?days=7')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setAllUsers(data)
    } catch (error) {
      console.error('Error fetching all users:', error)
    }
  }

  const fetchAllAppointments = async () => {
    try {
      const response = await fetch('/api/admin/appointments')
      const data = await response.json()
      setAllAppointments(data)
    } catch (error) {
      console.error('Error fetching all appointments:', error)
    }
  }

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      setSystemSettings(data)
    } catch (error) {
      console.error('Error fetching system settings:', error)
    }
  }

  const createUser = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      if (response.ok) {
        await fetchAllUsers()
        await fetchUsers() // Actualizar la lista principal también
        setNewUser({ name: '', email: '', role: 'PATIENT' })
        setShowCreateUserForm(false)
        alert('Usuario creado exitosamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      })
      
      if (response.ok) {
        await fetchAllAppointments()
        setNewAppointment({ doctorId: '', patientId: '', date: '', notes: '' })
        setShowCreateAppointmentForm(false)
        alert('Cita creada exitosamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear cita')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Error al crear cita')
    } finally {
      setLoading(false)
    }
  }

  const sendDocuments = async () => {
    if (!consultation || !sendDestination) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/send/${sendMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: consultation.id,
          destination: sendDestination,
          patientName: selectedPatient?.name,
          doctorName: selectedDoctor?.name,
          documentTypes: ['report', 'prescription', 'instructions'] // Enviar los 3 PDFs
        })
      })
      
      if (response.ok) {
        alert(`Documentos médicos enviados exitosamente por ${sendMethod === 'email' ? 'Email' : 'WhatsApp'} a ${sendDestination}`)
        // No cambiar de paso, mantener en el mismo para permitir más envíos
      } else {
        alert('Error al enviar los documentos. Por favor, intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error sending documents:', error)
      alert('Error al enviar los documentos. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const doctors = users.filter(user => user.role === 'DOCTOR')
  const patients = users.filter(user => user.role === 'PATIENT')

  const stepTitles = [
    "Selección de Usuario",
    "Dashboard Administrativo",
    "Agenda del Doctor", 
    "Selección de Paciente",
    "Información del Paciente",
    "Video Consulta",
    "Anotaciones Médicas",
    "Documentos",
    "Envío de Documentos"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Summari</h1>
            </div>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center space-x-4">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === index 
                      ? 'bg-blue-600 text-white' 
                      : currentStep > index 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > index ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${currentStep > index ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-xl font-semibold text-white">{stepTitles[currentStep]}</h2>
          </div>

          <div className="p-6">
            {/* Step 0: User Selection */}
            {currentStep === Step.USER_SELECTION && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido a Summari!</h3>
                  <p className="text-gray-600">Selecciona tu rol para comenzar</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <button
                    onClick={() => {
                      setSelectedUser({ role: 'DOCTOR' } as UserType)
                      setCurrentStep(Step.DOCTOR_AGENDA)
                    }}
                    className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Doctor</h4>
                    <p className="text-gray-600 mt-2">Gestionar consultas y pacientes</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedUser({ role: 'PATIENT' } as UserType)
                      setCurrentStep(Step.PATIENT_SELECTION)
                    }}
                    className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors group"
                  >
                    <User className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">Paciente</h4>
                    <p className="text-gray-600 mt-2">Acceder a consultas médicas</p>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUser({ id: 'admin', name: 'Admin', email: 'admin@summari.com', role: 'ADMIN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as UserType)
                      setCurrentStep(Step.ADMIN_DASHBOARD)
                      fetchAnalytics()
                      fetchAllUsers()
                      fetchAllAppointments()
                      fetchSystemSettings()
                    }}
                    className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                  >
                    <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">Administrador</h4>
                    <p className="text-gray-600 mt-2">Gestionar plataforma y analytics</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Doctor Agenda */}
            {currentStep === Step.DOCTOR_AGENDA && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Seleccionar Doctor</h3>
                  <button
                    onClick={() => setCurrentStep(Step.USER_SELECTION)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => {
                        setSelectedDoctor(doctor)
                        fetchDoctorAppointments(doctor.id)
                      }}
                      className={`p-4 rounded-lg border transition-colors ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                      <p className="text-sm text-gray-600">{doctor.email}</p>
                    </button>
                  ))}
                </div>

                {selectedDoctor && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Citas de {selectedDoctor.name}
                    </h4>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Cargando citas...</p>
                      </div>
                    ) : appointments.length > 0 ? (
                      <div className="space-y-3">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              selectedAppointment?.id === appointment.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{appointment.patient.name}</p>
                                <p className="text-sm text-gray-600">{appointment.patient.email}</p>
                                <p className="text-sm text-gray-500">{formatDate(appointment.date)}</p>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">No hay citas programadas</p>
                    )}

                    {selectedAppointment && (
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={() => {
                            setSelectedPatient(selectedAppointment.patient)
                            fetchPatientMedicalRecords(selectedAppointment.patient.id)
                            setCurrentStep(Step.PATIENT_INFO)
                          }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          Ver Información del Paciente
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Admin Dashboard */}
            {currentStep === Step.ADMIN_DASHBOARD && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h3>
                  <button
                    onClick={() => setCurrentStep(Step.USER_SELECTION)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                </div>

                {/* KPIs Summary */}
                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Total Consultas</p>
                          <p className="text-2xl font-bold">{analytics.summary.totalConsultations}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Tasa de Completación</p>
                          <p className="text-2xl font-bold">{analytics.summary.completionRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Ingresos Totales</p>
                          <p className="text-2xl font-bold">${analytics.summary.totalRevenue}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">Usuarios Activos</p>
                          <p className="text-2xl font-bold">{analytics.summary.activeUsers}</p>
                        </div>
                        <Users className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Management Sections */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* User Management */}
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Gestión de Usuarios
                      </h4>
                      <button
                        onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                      </button>
                    </div>

                    {showCreateUserForm && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                            placeholder="Nombre completo"
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            placeholder="Email"
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                          <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="PATIENT">Paciente</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={createUser}
                            disabled={loading || !newUser.name || !newUser.email}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? 'Creando...' : 'Crear Usuario'}
                          </button>
                          <button
                            onClick={() => setShowCreateUserForm(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {allUsers.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Appointment Management */}
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-green-600" />
                        Gestión de Citas
                      </h4>
                      <button
                        onClick={() => setShowCreateAppointmentForm(!showCreateAppointmentForm)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Cita
                      </button>
                    </div>

                    {showCreateAppointmentForm && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <select
                            value={newAppointment.doctorId}
                            onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          >
                            <option value="">Seleccionar Doctor</option>
                            {allUsers.filter((u: any) => u.role === 'DOCTOR').map((doctor: any) => (
                              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                            ))}
                          </select>
                          <select
                            value={newAppointment.patientId}
                            onChange={(e) => setNewAppointment({...newAppointment, patientId: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          >
                            <option value="">Seleccionar Paciente</option>
                            {allUsers.filter((u: any) => u.role === 'PATIENT').map((patient: any) => (
                              <option key={patient.id} value={patient.id}>{patient.name}</option>
                            ))}
                          </select>
                          <input
                            type="datetime-local"
                            value={newAppointment.date}
                            onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          />
                          <input
                            type="text"
                            value={newAppointment.notes}
                            onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                            placeholder="Notas (opcional)"
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={createAppointment}
                            disabled={loading || !newAppointment.doctorId || !newAppointment.patientId || !newAppointment.date}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? 'Creando...' : 'Crear Cita'}
                          </button>
                          <button
                            onClick={() => setShowCreateAppointmentForm(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {allAppointments.slice(0, 10).map((appointment: any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">
                              Dr. {appointment.doctor.name} - {appointment.patient.name}
                            </p>
                            <p className="text-sm text-gray-600">{formatDate(appointment.date)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analytics Chart */}
                {analytics && (
                  <div className="bg-white rounded-lg border p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                      Tendencias de Consultas (Últimos 7 días)
                    </h4>
                    <div className="grid grid-cols-7 gap-2 h-40">
                      {analytics.analytics.map((day: any, index: number) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="flex-1 flex items-end">
                            <div 
                              className="w-8 bg-blue-500 rounded-t"
                              style={{ height: `${Math.max((day.totalConsultations / Math.max(...analytics.analytics.map((d: any) => d.totalConsultations))) * 100, 10)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                          </p>
                          <p className="text-xs font-medium text-gray-900">{day.totalConsultations}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Patient Selection */}
            {currentStep === Step.PATIENT_SELECTION && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Seleccionar Paciente</h3>
                  <button
                    onClick={() => setCurrentStep(Step.USER_SELECTION)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                </div>

                <div className="text-center mb-6">
                  <p className="text-gray-600">Selecciona tu perfil de paciente para continuar</p>
                </div>

                {patients.length > 0 ? (
                  <div className="grid gap-4">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedPatient(patient)
                          fetchPatientMedicalRecords(patient.id)
                          fetchPatientAppointments(patient.id)
                          setCurrentStep(Step.PATIENT_INFO)
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                            <p className="text-sm text-gray-600">{patient.email}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No hay pacientes disponibles</h4>
                    <p className="text-gray-600">No se encontraron pacientes registrados en el sistema.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Patient Info */}
            {currentStep === Step.PATIENT_INFO && selectedPatient && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Información del Paciente</h3>
                  <button
                    onClick={() => setCurrentStep(selectedUser?.role === 'DOCTOR' ? Step.DOCTOR_AGENDA : Step.PATIENT_SELECTION)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <User className="w-12 h-12 text-gray-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h4>
                      <p className="text-gray-600">{selectedPatient.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Historial Médico</h4>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Cargando historial médico...</p>
                    </div>
                  ) : medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {medicalRecords.map((record) => (
                        <div key={record.id} className="bg-white border rounded-lg p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Diagnóstico:</p>
                              <p className="text-gray-700">{record.diagnosis}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Tratamiento:</p>
                              <p className="text-gray-700">{record.treatment}</p>
                            </div>
                            {record.medications && (
                              <div>
                                <p className="text-sm font-medium text-gray-900">Medicamentos:</p>
                                <p className="text-gray-700">{record.medications}</p>
                              </div>
                            )}
                            {record.allergies && (
                              <div>
                                <p className="text-sm font-medium text-gray-900">Alergias:</p>
                                <p className="text-gray-700">{record.allergies}</p>
                              </div>
                            )}
                          </div>
                          {record.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium text-gray-900">Notas:</p>
                              <p className="text-gray-700">{record.notes}</p>
                            </div>
                          )}
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500">
                              Fecha: {formatDate(record.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No hay registros médicos disponibles</p>
                  )}
                </div>

                {/* Citas del Paciente */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Mis Citas Programadas</h4>
                  
                  {selectedUser?.role === 'PATIENT' && (
                    <div className="space-y-4">
                      {appointments.filter(apt => apt.patient.id === selectedPatient.id).length > 0 ? (
                        appointments.filter(apt => apt.patient.id === selectedPatient.id).map((appointment) => (
                          <div 
                            key={appointment.id} 
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedAppointment?.id === appointment.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setSelectedDoctor(appointment.doctor)
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-900">
                                  Dr. {appointment.doctor.name}
                                </h5>
                                <p className="text-sm text-gray-600">{appointment.doctor.email}</p>
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>{formatDate(appointment.date)}</span>
                                  <Clock className="w-4 h-4 mr-1 ml-4" />
                                  <span>{new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center py-8">No tienes citas programadas</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => selectedAppointment && startConsultation(selectedAppointment.id)}
                    disabled={loading || !selectedAppointment}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {loading ? 'Iniciando...' : 'Iniciar Video Consulta'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Video Consultation */}
            {currentStep === Step.VIDEO_CONSULTATION && consultation && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Video Consulta en Progreso</h3>
                  <p className="text-gray-600">Sesión iniciada: {formatDate(consultation.createdAt)}</p>
                </div>

                {/* Interface diferenciada por rol */}
                {selectedUser?.role === 'DOCTOR' ? (
                  // Interface para DOCTOR con anotaciones
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Panel de Video (2/3 del ancho) */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                        <div className="text-center text-white">
                          <Video className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-lg">Video Consulta en Vivo</p>
                          <p className="text-sm opacity-75">Doctor: {selectedDoctor?.name}</p>
                          <p className="text-sm opacity-75">Paciente: {selectedPatient?.name}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Información de la Consulta:</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">ID Consulta:</span> {consultation.id}
                          </div>
                          <div>
                            <span className="font-medium">Estado:</span> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(consultation.status)}`}>
                              {consultation.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Duración:</span> En curso
                          </div>
                          <div>
                            <span className="font-medium">Fecha:</span> {formatDate(consultation.date)}
                          </div>
                        </div>
                      </div>

                      {/* Archivos subidos por el paciente - Siempre visible para el doctor */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-green-600" />
                          Documentos del Paciente
                          {patientFiles.length > 0 && (
                            <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              {patientFiles.length}
                            </span>
                          )}
                        </h4>
                        
                        {patientFiles.length > 0 ? (
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {patientFiles.map(file => (
                              <div key={file.id} className="flex items-center justify-between bg-white rounded p-3 text-sm border">
                                <div className="flex items-center flex-1">
                                  <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                    </p>
                                  </div>
                                  {file.uploaded && (
                                    <Check className="w-4 h-4 ml-2 text-green-600" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {file.uploaded ? (
                                    <>
                                      <button 
                                        onClick={() => {
                                          // Simular descarga
                                          const url = URL.createObjectURL(file.file)
                                          const a = document.createElement('a')
                                          a.href = url
                                          a.download = file.name
                                          document.body.appendChild(a)
                                          a.click()
                                          document.body.removeChild(a)
                                          URL.revokeObjectURL(url)
                                        }}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                                        title="Descargar archivo"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          // Simular vista previa
                                          if (file.type.startsWith('image/')) {
                                            const url = URL.createObjectURL(file.file)
                                            window.open(url, '_blank')
                                          } else {
                                            alert('Vista previa no disponible para este tipo de archivo')
                                          }
                                        }}
                                        className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
                                        title="Vista previa"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                      Subiendo...
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-green-300 rounded-lg">
                            <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              El paciente no ha subido documentos aún
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Los archivos aparecerán aquí automáticamente
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Panel de Anotaciones y Chat - SOLO DOCTOR */}
                    <div className="lg:col-span-1 space-y-4">
                      {/* Anotaciones Médicas */}
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-600" />
                          Anotaciones Médicas
                        </h4>
                        
                        <form className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Síntomas Observados
                            </label>
                            <textarea
                              value={medicalNotes.symptoms}
                              onChange={(e) => setMedicalNotes(prev => ({ ...prev, symptoms: e.target.value }))}
                              placeholder="Anote síntomas conforme los observe..."
                              className="w-full h-12 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Diagnóstico Preliminar
                            </label>
                            <textarea
                              value={medicalNotes.diagnosis}
                              onChange={(e) => setMedicalNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                              placeholder="Diagnóstico basado en la evaluación..."
                              className="w-full h-12 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Plan de Tratamiento
                            </label>
                            <textarea
                              value={medicalNotes.treatment}
                              onChange={(e) => setMedicalNotes(prev => ({ ...prev, treatment: e.target.value }))}
                              placeholder="Tratamiento a seguir..."
                              className="w-full h-12 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Medicamentos
                            </label>
                            <textarea
                              value={medicalNotes.prescription}
                              onChange={(e) => setMedicalNotes(prev => ({ ...prev, prescription: e.target.value }))}
                              placeholder="Medicamentos y dosis..."
                              className="w-full h-12 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={saveMedicalNotes}
                            disabled={loading}
                            className="w-full bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? 'Guardando...' : 'Guardar Anotaciones'}
                          </button>
                        </form>
                      </div>

                      {/* Chat con Paciente - SOLO DOCTOR */}
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                          Chat con Paciente
                        </h4>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto mb-3 border rounded p-2 bg-gray-50">
                          {chatMessages.length === 0 ? (
                            <p className="text-gray-500 text-xs text-center py-4">
                              No hay mensajes aún
                            </p>
                          ) : (
                            chatMessages.map(msg => (
                              <div key={msg.id} className={`p-2 rounded text-xs ${
                                msg.sender === 'doctor' 
                                  ? 'bg-blue-100 ml-4 text-blue-800' 
                                  : 'bg-white mr-4 text-gray-800 border'
                              }`}>
                                <div className="flex justify-between items-start">
                                  <p className="flex-1">{msg.message}</p>
                                  <span className={`text-xs ml-2 ${
                                    msg.sender === 'doctor' ? 'text-blue-600' : 'text-gray-500'
                                  }`}>
                                    {msg.sender === 'doctor' ? 'Tú' : 'Paciente'}
                                  </span>
                                </div>
                                <p className={`text-xs mt-1 ${
                                  msg.sender === 'doctor' ? 'text-blue-500' : 'text-gray-400'
                                }`}>
                                  {msg.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                            placeholder="Escribir al paciente..."
                            className="flex-1 px-2 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                          <button
                            onClick={sendChatMessage}
                            disabled={!currentMessage.trim()}
                            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Interface para PACIENTE con chat y archivos
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Panel de Video Principal (2/3 del ancho) */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                        <div className="text-center text-white">
                          <Video className="w-20 h-20 mx-auto mb-4" />
                          <p className="text-xl">Consulta Médica en Vivo</p>
                          <p className="text-lg opacity-90 mt-2">Dr. {selectedDoctor?.name}</p>
                          <p className="text-sm opacity-75">Especialista</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Tu Consulta Médica</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-800">Doctor:</span> 
                            <span className="ml-2 text-blue-700">Dr. {selectedDoctor?.name}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Fecha:</span> 
                            <span className="ml-2 text-blue-700">{formatDate(consultation.date)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Estado:</span> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(consultation.status)}`}>
                              En Progreso
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">ID Consulta:</span> 
                            <span className="ml-2 text-blue-700 font-mono text-xs">{consultation.id.slice(-8)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Panel de Comunicación del Paciente (1/3 del ancho) */}
                    <div className="lg:col-span-1 space-y-4">
                      {/* Chat con el Doctor */}
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                          Chat con el Doctor
                        </h4>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                          {chatMessages.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                              Inicia la conversación con tu doctor
                            </p>
                          ) : (
                            chatMessages.map(msg => (
                              <div key={msg.id} className="bg-blue-50 rounded p-2 text-sm">
                                <p className="text-gray-800">{msg.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {msg.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={sendChatMessage}
                            disabled={!currentMessage.trim()}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Subir Archivos */}
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Upload className="w-5 h-5 mr-2 text-green-600" />
                          Subir Exámenes
                        </h4>
                        
                        <div className="mb-3">
                          <input
                            type="file"
                            id="patient-files"
                            multiple
                            onChange={handlePatientFileUpload}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="hidden"
                          />
                          <label
                            htmlFor="patient-files"
                            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                          >
                            <Upload className="w-5 h-5 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Seleccionar archivos
                            </span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, imágenes, documentos (máx. 5MB)
                          </p>
                        </div>

                        {patientFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600 font-medium border-b pb-1">
                              Mis Documentos ({patientFiles.length})
                            </p>
                            {patientFiles.map(file => (
                              <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded p-3 text-sm border">
                                <div className="flex items-center flex-1">
                                  <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                                  <div className="flex-1">
                                    <p className="truncate font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {file.uploaded ? (
                                    <div className="flex items-center">
                                      <Check className="w-4 h-4 text-green-600" />
                                      <span className="text-xs text-green-600 ml-1">Subido</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => uploadPatientFile(file.id)}
                                      className="text-blue-600 hover:text-blue-800 flex items-center"
                                      title="Subir archivo"
                                    >
                                      <Upload className="w-4 h-4" />
                                      <span className="text-xs ml-1">Subir</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setPatientFiles(prev => prev.filter(f => f.id !== file.id))}
                                    className="text-red-600 hover:text-red-800"
                                    title="Eliminar archivo"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {patientFiles.some(f => f.uploaded) && (
                              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-green-700 flex items-center">
                                  <Check className="w-3 h-3 mr-1" />
                                  Los archivos subidos están disponibles para el doctor
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCurrentStep(Step.PATIENT_INFO)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Volver
                  </button>
                  {selectedUser?.role === 'DOCTOR' && (
                    <button
                      onClick={completeConsultation}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                    >
                      {loading ? 'Finalizando...' : 'Finalizar Consulta'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  )}
                  {selectedUser?.role === 'PATIENT' && (
                    <button
                      onClick={() => alert('La consulta será finalizada por el doctor')}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Consulta en Progreso
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Medical Notes */}
            {currentStep === Step.MEDICAL_NOTES && consultation && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Anotaciones Médicas</h3>
                  <button
                    onClick={() => setCurrentStep(Step.VIDEO_CONSULTATION)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Información de la Consulta</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Doctor:</span> {selectedDoctor?.name}
                    </div>
                    <div>
                      <span className="font-medium">Paciente:</span> {selectedPatient?.name}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {formatDate(consultation.date)}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                </div>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Síntomas Observados
                      </label>
                      <textarea
                        value={medicalNotes.symptoms}
                        onChange={(e) => setMedicalNotes(prev => ({ ...prev, symptoms: e.target.value }))}
                        placeholder="Descripción detallada de los síntomas reportados y observados..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diagnóstico
                      </label>
                      <textarea
                        value={medicalNotes.diagnosis}
                        onChange={(e) => setMedicalNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                        placeholder="Diagnóstico clínico basado en los síntomas y evaluación..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tratamiento
                      </label>
                      <textarea
                        value={medicalNotes.treatment}
                        onChange={(e) => setMedicalNotes(prev => ({ ...prev, treatment: e.target.value }))}
                        placeholder="Plan de tratamiento recomendado..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receta / Medicamentos
                      </label>
                      <textarea
                        value={medicalNotes.prescription}
                        onChange={(e) => setMedicalNotes(prev => ({ ...prev, prescription: e.target.value }))}
                        placeholder="Medicamentos prescritos, dosis, frecuencia..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recomendaciones
                      </label>
                      <textarea
                        value={medicalNotes.recommendations}
                        onChange={(e) => setMedicalNotes(prev => ({ ...prev, recommendations: e.target.value }))}
                        placeholder="Recomendaciones generales, cuidados, estilo de vida..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seguimiento
                      </label>
                      <textarea
                        value={medicalNotes.followUp}
                        onChange={(e) => setMedicalNotes(prev => ({ ...prev, followUp: e.target.value }))}
                        placeholder="Próxima cita, controles, estudios adicionales..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionales
                    </label>
                    <textarea
                      value={medicalNotes.additionalNotes}
                      onChange={(e) => setMedicalNotes(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      placeholder="Observaciones adicionales, comentarios especiales..."
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(Step.VIDEO_CONSULTATION)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      onClick={saveMedicalNotes}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar y Continuar'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 6: Documents */}
            {currentStep === Step.DOCUMENTS && consultation && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Documentos de la Consulta</h3>
                  <button
                    onClick={() => setCurrentStep(Step.MEDICAL_NOTES)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Consulta Completada</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Doctor:</span> {selectedDoctor?.name}
                    </div>
                    <div>
                      <span className="font-medium">Paciente:</span> {selectedPatient?.name}
                    </div>
                    {consultation.diagnosis && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Diagnóstico:</span> {consultation.diagnosis}
                      </div>
                    )}
                    {consultation.treatment && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Tratamiento:</span> {consultation.treatment}
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Generator Component - Documentos Generados */}
                {selectedPatient && (
                  <PDFGenerator 
                    consultationId={consultation.id}
                    patientName={selectedPatient.name}
                  />
                )}

                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => setCurrentStep(Step.SEND_DOCUMENTS)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    Continuar al Envío
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Send Documents */}
            {currentStep === Step.SEND_DOCUMENTS && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Enviar Documentos al Paciente</h3>
                  <button
                    onClick={() => setCurrentStep(Step.DOCUMENTS)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Documentos Médicos Generados</h4>
                  <p className="text-blue-800 text-sm">
                    Los siguientes documentos han sido generados automáticamente y están listos para enviar al paciente:
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileText className="w-4 h-4" />
                      <span>📄 Informe Médico Completo</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileText className="w-4 h-4" />
                      <span>💊 Receta Médica</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileText className="w-4 h-4" />
                      <span>📋 Indicaciones y Recomendaciones</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Envío
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSendMethod('email')}
                        className={`p-4 rounded-lg border transition-colors ${
                          sendMethod === 'email'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="font-medium">Email</p>
                        <p className="text-xs text-gray-500">Envío inmediato</p>
                      </button>
                      <button
                        onClick={() => setSendMethod('whatsapp')}
                        className={`p-4 rounded-lg border transition-colors ${
                          sendMethod === 'whatsapp'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-xs text-gray-500">Con enlace de descarga</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {sendMethod === 'email' ? 'Correo Electrónico del Paciente' : 'Número de WhatsApp del Paciente'}
                    </label>
                    <input
                      type={sendMethod === 'email' ? 'email' : 'tel'}
                      value={sendDestination}
                      onChange={(e) => setSendDestination(e.target.value)}
                      placeholder={sendMethod === 'email' ? 'paciente@email.com' : '+1234567890'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {selectedPatient && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Destinatario:</span> {selectedPatient.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Doctor:</span> Dr. {selectedDoctor?.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={sendDocuments}
                    disabled={!sendDestination || loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {loading ? 'Enviando Documentos...' : `Enviar Documentos por ${sendMethod === 'email' ? 'Email' : 'WhatsApp'}`}
                  </button>
                </div>

                <div className="text-center pt-6">
                  <button
                    onClick={() => {
                      // Reset all states
                      setCurrentStep(Step.USER_SELECTION)
                      setSelectedUser(null)
                      setSelectedDoctor(null)
                      setSelectedPatient(null)
                      setSelectedAppointment(null)
                      setConsultation(null)
                      setConsultationDocuments([])
                      setSendDestination('')
                    }}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Iniciar Nueva Consulta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
