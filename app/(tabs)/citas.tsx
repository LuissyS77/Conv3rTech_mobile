// app/(tabs)/citas.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import AppointmentCard from '../../components/AppointmentCard'; // Lo crearemos en el paso 3
import { Appointment, sampleAppointments } from '../../model/appoiments';
import { AppColors } from '@/constants/theme';

// --- Lógica de Agrupación (Similar a los Helpers de Flutter) ---

// Helper para verificar si dos fechas son el mismo día
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper para agrupar citas
const groupAppointments = (allAppointments: Appointment[]) => {
  const grouped: { [key: string]: Appointment[] } = {
    Today: [],
    Tomorrow: [],
    ThisWeek: [],
  };

  const now = new Date();
  // Crea el inicio de hoy sin la hora, para la comparación
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime());
  tomorrowStart.setDate(todayStart.getDate() + 1);

  // Fecha límite: hasta 7 días a partir de mañana
  const endOfThisWeek = new Date(tomorrowStart.getTime());
  endOfThisWeek.setDate(tomorrowStart.getDate() + 6); 

  for (const appointment of allAppointments) {
    const appointmentDate = appointment.startTime;

    if (isSameDay(appointmentDate, now)) {
      grouped['Today'].push(appointment);
    } else if (isSameDay(appointmentDate, tomorrowStart)) {
      grouped['Tomorrow'].push(appointment);
    } else if (appointmentDate.getTime() > tomorrowStart.getTime() && appointmentDate.getTime() < endOfThisWeek.getTime()) {
      grouped['ThisWeek'].push(appointment);
    }
  }

  // Opcional: Ordenar las citas dentro de cada grupo por hora
  Object.values(grouped).forEach(list => {
    list.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  });

  return grouped;
};

// Helper para obtener el título de la sección en español
const getLocalizedSectionTitle = (englishTitle: string): string => {
  switch (englishTitle) {
    case 'Today':
      return 'Hoy';
    case 'Tomorrow':
      return 'Mañana';
    case 'ThisWeek':
      return 'Esta Semana';
    default:
      return englishTitle;
  }
};

// --- Componente Principal ---

export default function CitasScreen() {
  // Aquí es donde en el futuro harás la llamada a la API
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const groupedAppointments = groupAppointments(allAppointments);
  
  
  // Simulación de initState / Carga de datos
  useEffect(() => {
    // Aquí pondrías tu lógica fetch o axios para consumir la API
    // Por ahora, usamos los datos de ejemplo:
    setAllAppointments(sampleAppointments);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.panel}>
          {Object.keys(groupedAppointments).map((sectionTitleKey) => {
            const appointmentsInSection = groupedAppointments[sectionTitleKey];
            if (appointmentsInSection.length === 0) return null;
            return (
              <View key={sectionTitleKey} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{getLocalizedSectionTitle(sectionTitleKey)}</Text>
                <View style={styles.sectionList}>
                  {appointmentsInSection.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// --- Estilos (Styles) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: Platform.OS === 'ios' ? 40 : 20, // Reduced padding further
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 0, // Removed extra top padding
    paddingBottom: 120,
  },
  panel: {
    // Removed panel background to match the cleaner look in the image
    // The cards themselves will provide the structure
    padding: 0, 
  },
  panelTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.textPrimary, // Darker title as in image
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionList: {
    gap: 4,
  }
});