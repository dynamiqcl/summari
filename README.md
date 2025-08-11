# Summari - Plataforma de Teleconsulta

Una plataforma moderna de teleconsulta médica construida con Next.js, TypeScript y Prisma.

## Características

- 🏥 **Gestión de usuarios**: Médicos y pacientes predefinidos para pruebas
- 📅 **Agenda médica**: Vista de citas programadas para médicos
- 📋 **Historial clínico**: Acceso a información médica de pacientes
- 🎥 **Video consulta**: Simulador de videollamada médica
- 📝 **Anotaciones**: Sistema para registrar notas durante la consulta
- 📄 **Envío de documentos**: Gestión y envío de recetas e indicaciones
- 📱 **Envío por WhatsApp/Email**: Opciones de comunicación
- ⏰ **Agendamiento**: Sistema para programar próximas citas

## Flujo de la aplicación

1. **Selección de usuario**: Elige entre médicos o pacientes
2. **Agenda del día** (médicos): Visualiza citas programadas
3. **Ficha médica**: Acceso a información del paciente
4. **Video consulta**: Simulación de llamada con anotaciones
5. **Documentos**: Verificación y envío de documentos
6. **Finalización**: Resumen y agendamiento de próxima cita

## Tecnologías utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: SQLite con Prisma ORM
- **Iconos**: Lucide React

## Instalación y configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Pasos de instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar la base de datos**
   ```bash
   npx prisma migrate dev --name init
   npx tsx prisma/seed.ts
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Estructura del proyecto

```
summari/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página principal con flujo completo
│   │   └── layout.tsx        # Layout base
│   └── lib/
│       └── prisma.ts         # Configuración de Prisma
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos
│   ├── seed.ts              # Datos de prueba
│   └── migrations/          # Migraciones de BD
└── ...
```

## Usuarios de prueba

### Médicos
- Dr. María González (maria.gonzalez@summari.com)
- Dr. Carlos Rodríguez (carlos.rodriguez@summari.com)

### Pacientes
- Ana Martínez (ana.martinez@email.com) - Hipertensión
- Juan Pérez (juan.perez@email.com) - Diabetes tipo 2
- Sofia López (sofia.lopez@email.com) - Primera consulta

## Scripts disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción
- `npm run lint` - Ejecutar ESLint
- `npx prisma studio` - Abrir Prisma Studio para gestión de BD

## Próximas mejoras

- [ ] Integración con servicios de videollamada reales
- [ ] Sistema de notificaciones
- [ ] Gestión de archivos y documentos
- [ ] Integración con WhatsApp Business API
- [ ] Sistema de pagos
- [ ] Historial completo de consultas
- [ ] Calendario interactivo

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
