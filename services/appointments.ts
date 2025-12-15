import api from './api';
import { Appointment, AppointmentStatus } from '../model/appoiments';
import { Platform } from 'react-native';

const mapStatus = (status: string): AppointmentStatus => {
  if (status === 'Completada') return 'Completado';
  if (status === 'Cancelada') return 'Cancelado';
  return 'Pendiente';
};

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await api.get('/appointments');
      
      return response.data.map((item: any) => ({
        id: item.id_cita.toString(),
        clientName: item.cliente
          ? `${item.cliente.nombre} ${item.cliente.apellido}`
          : 'Cliente desconocido',
        addressName: item.direccion_cliente?.nombre_direccion || undefined,
        taskDescription: item.servicio
          ? item.servicio.nombre || item.servicio.descripcion || 'Cita de Servicio'
          : (item.observaciones || 'Cita de Servicio'),
        location:
          item.direccion_cliente
            ? `${item.direccion_cliente.direccion || ''}${
                item.direccion_cliente.ciudad ? `, ${item.direccion_cliente.ciudad}` : ''
              }`.trim() || 'Sin dirección'
            : (item.direccion || 'Sin dirección'),
        startTime: new Date(`${item.fecha}T${item.hora_inicio}`),
        endTime: new Date(`${item.fecha}T${item.hora_fin}`),
        status: mapStatus(item.estado),
        evidenceUrl: item.evidencia_foto,
        clientId: item.id_cliente,
        userId: item.id_usuario,
        serviceId: item.id_servicio,
        rawDate: item.fecha,
        rawStartTime: item.hora_inicio,
        rawEndTime: item.hora_fin,
      }));
    } catch (error) {
      console.error('Error fetching appointments', error);
      throw error;
    }
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await api.get(`/appointments/${id}`);
      const item = response.data;
      const mapped: Appointment = {
        id: item.id_cita.toString(),
        clientName: item.cliente
          ? `${item.cliente.nombre} ${item.cliente.apellido}`
          : 'Cliente desconocido',
        addressName: item.direccion_cliente?.nombre_direccion || undefined,
        taskDescription: item.servicio
          ? item.servicio.nombre || item.servicio.descripcion || 'Cita de Servicio'
          : (item.observaciones || 'Cita de Servicio'),
        location:
          item.direccion_cliente
            ? `${item.direccion_cliente.direccion || ''}${
                item.direccion_cliente.ciudad ? `, ${item.direccion_cliente.ciudad}` : ''
              }`.trim() || 'Sin dirección'
            : (item.direccion || 'Sin dirección'),
        startTime: new Date(`${item.fecha}T${item.hora_inicio}`),
        endTime: new Date(`${item.fecha}T${item.hora_fin}`),
        status: mapStatus(item.estado),
        evidenceUrl: item.evidencia_foto,
        clientId: item.id_cliente,
        userId: item.id_usuario,
        serviceId: item.id_servicio,
        rawDate: item.fecha,
        rawStartTime: item.hora_inicio,
        rawEndTime: item.hora_fin,
      };
      console.log('getAppointmentById mapped', {
        id: mapped.id,
        status: mapped.status,
        evidenceUrl: mapped.evidenceUrl,
      });
      return mapped;
    } catch (error) {
      console.error('Error fetching appointment details', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointment: Appointment, status: string, evidenceUrl?: string): Promise<void> {
    try {
      const payload: any = {
        id_cliente: appointment.clientId,
        id_usuario: appointment.userId,
        id_servicio: appointment.serviceId,
        fecha: appointment.rawDate,
        hora_inicio: appointment.rawStartTime,
        hora_fin: appointment.rawEndTime,
        estado: status,
      };
      if (evidenceUrl) {
        payload.evidencia_foto = evidenceUrl;
      }
      // Map frontend status back to backend status
      if (status === 'Completado') payload.estado = 'Completada';
      if (status === 'Cancelado') payload.estado = 'Cancelada';
      console.log('updateAppointmentStatus request', { id: appointment.id, payload });
      await api.put(`/appointments/${appointment.id}`, payload);
      console.log('updateAppointmentStatus success', { id: appointment.id });
    } catch (error) {
      console.error('Error updating appointment', error);
      if ((error as any).response) {
        console.log('updateAppointmentStatus response data', (error as any).response.data);
      }
      throw error;
    }
  },

  async uploadEvidence(uri: string): Promise<string> {
    try {
      console.log('uploadEvidence start', { uri, platform: Platform.OS });
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append('imagen', blob as any, 'evidence.jpg');
      } else {
        formData.append('imagen', {
          uri,
          name: 'evidence.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await api.post('/upload', formData);

      console.log('uploadEvidence response data', response.data);
      if (response.data.url) {
        return response.data.url;
      }
      throw new Error('No se pudo subir la imagen');
    } catch (error) {
      console.error('Error uploading evidence', error);
      if ((error as any).response) {
        console.log('uploadEvidence response data error', (error as any).response.data);
      }
      throw error;
    }
  }
};
