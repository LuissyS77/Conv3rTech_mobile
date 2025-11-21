// models/appointment.ts

// 1. Definición del Estado (Status)
export type AppointmentStatus = 'Pendiente' | 'Completado' | 'Cancelado';

// Helper para mapear el estado a un color (simulando tu lógica de Flutter)
export const getStatusColor = (status: AppointmentStatus): string => {
  switch (status) {
    case 'Completado':
      return 'green';
    case 'Cancelado':
      return 'red';
    case 'Pendiente':
    default:
      return '#FF9F1C';
  }
};

// 2. Definición de la Interfaz (Clase en JS/TS)
export interface Appointment {
  id: string;
  clientName: string;
  taskDescription: string;
  location: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
}

// 3. Datos de Ejemplo (Hardcodeados para empezar)
const now = new Date();
const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0);
const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 15, 0);

export const sampleAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Juan Pérez (Hoy)',
    taskDescription: 'Revisión trimestral de proyecto X.',
    location: 'Oficina Central, Sala 201',
    startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30),
    endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30),
    status: 'Pendiente',
  },
  {
    id: '2',
    clientName: 'María López (Mañana)',
    taskDescription: 'Presentación de propuesta de diseño.',
    location: 'Llamada Zoom',
    startTime: tomorrow,
    endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hora después
    status: 'Cancelado',
  },
  {
    id: '3',
    clientName: 'Carlos García (Esta Semana)',
    taskDescription: 'Cierre de contrato con proveedor A.',
    location: 'Teletrabajo',
    startTime: nextWeek,
    endTime: new Date(nextWeek.getTime() + 90 * 60 * 1000), // 1.5 horas después
    status: 'Completado',
  },
];