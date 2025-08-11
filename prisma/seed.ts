import { prisma } from '@/lib/prisma'

async function main() {
  // Crear usuarios administradores
  const admin1 = await prisma.user.create({
    data: {
      name: 'Admin Principal',
      email: 'admin@summari.com',
      role: 'ADMIN',
    },
  })

  const admin2 = await prisma.user.create({
    data: {
      name: 'Gerente de Operaciones',
      email: 'gerente@summari.com',
      role: 'ADMIN',
    },
  })

  // Crear usuarios de prueba
  const doctor1 = await prisma.user.create({
    data: {
      name: 'Dr. María González',
      email: 'maria.gonzalez@summari.com',
      role: 'DOCTOR',
    },
  })

  const doctor2 = await prisma.user.create({
    data: {
      name: 'Dr. Carlos Rodríguez',
      email: 'carlos.rodriguez@summari.com',
      role: 'DOCTOR',
    },
  })

  const patient1 = await prisma.user.create({
    data: {
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      role: 'PATIENT',
    },
  })

  const patient2 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      role: 'PATIENT',
    },
  })

  const patient3 = await prisma.user.create({
    data: {
      name: 'Sofia López',
      email: 'sofia.lopez@email.com',
      role: 'PATIENT',
    },
  })

  // Crear historial médico para pacientes
  const medicalRecord1 = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      diagnosis: 'Hipertensión arterial',
      treatment: 'Medicación antihipertensiva',
      medications: 'Enalapril 10mg',
      allergies: 'Penicilina',
      notes: 'Paciente con buen control de presión arterial',
    },
  })

  const medicalRecord2 = await prisma.medicalRecord.create({
    data: {
      patientId: patient2.id,
      diagnosis: 'Diabetes tipo 2',
      treatment: 'Control dietético y medicación',
      medications: 'Metformina 850mg',
      allergies: 'Ninguna conocida',
      notes: 'Paciente colaborativo con el tratamiento',
    },
  })

  // Crear citas programadas
  const appointment1 = await prisma.appointment.create({
    data: {
      doctorId: doctor1.id,
      patientId: patient1.id,
      date: new Date('2025-08-12T09:00:00'),
      status: 'SCHEDULED',
      notes: 'Control rutinario de hipertensión',
    },
  })

  const appointment2 = await prisma.appointment.create({
    data: {
      doctorId: doctor1.id,
      patientId: patient2.id,
      date: new Date('2025-08-12T10:30:00'),
      status: 'SCHEDULED',
      notes: 'Revisión de diabetes',
    },
  })

  const appointment3 = await prisma.appointment.create({
    data: {
      doctorId: doctor2.id,
      patientId: patient3.id,
      date: new Date('2025-08-12T11:00:00'),
      status: 'SCHEDULED',
      notes: 'Primera consulta',
    },
  })

  // Crear configuración del sistema
  const systemSettings = await prisma.systemSettings.create({
    data: {
      consultationPrice: 50.0,
      currency: 'USD',
      timeZone: 'America/New_York',
      maxConsultationDuration: 60,
      allowCancellation: true,
      cancellationDeadline: 24,
    },
  })

  // Crear métricas de ejemplo (últimos 7 días)
  const analyticsData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    analyticsData.push({
      date: date,
      totalConsultations: Math.floor(Math.random() * 20) + 10,
      completedConsultations: Math.floor(Math.random() * 15) + 8,
      cancelledConsultations: Math.floor(Math.random() * 3) + 1,
      averageDuration: Math.floor(Math.random() * 30) + 25,
      totalRevenue: Math.floor(Math.random() * 1000) + 500,
      activeUsers: Math.floor(Math.random() * 50) + 20,
    })
  }

  for (const data of analyticsData) {
    await prisma.analytics.create({ data })
  }

  console.log('Base de datos inicializada con datos de prueba')
  console.log(`Administradores creados: ${admin1.name}, ${admin2.name}`)
  console.log(`Doctores creados: ${doctor1.name}, ${doctor2.name}`)
  console.log(`Pacientes creados: ${patient1.name}, ${patient2.name}, ${patient3.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
