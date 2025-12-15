// app/(tabs)/citas.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl, Platform } from 'react-native';
import AppointmentCard from '../../components/AppointmentCard';
import { Appointment } from '../../model/appoiments';
import { appointmentService } from '../../services/appointments';
import { AppColors } from '@/constants/theme';
import { useFocusEffect } from 'expo-router';

// --- Lógica de Agrupación (Similar a los Helpers de Flutter) ---

// Helper para verificar si dos fechas son el mismo día
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper para agrupar citas por rango de fecha dentro del mes actual
const groupAppointments = (allAppointments: Appointment[]) => {
  const grouped: { [key: string]: Appointment[] } = {
    Today: [],
    Tomorrow: [],
    ThisMonth: [],
  };

  const now = new Date();
  // Crea el inicio de hoy sin la hora, para la comparación
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime());
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  for (const appointment of allAppointments) {
    const appointmentDate = appointment.startTime;

    if (isSameDay(appointmentDate, now)) {
      grouped['Today'].push(appointment);
    } else if (isSameDay(appointmentDate, tomorrowStart)) {
      grouped['Tomorrow'].push(appointment);
    } else if (
      appointmentDate.getFullYear() === currentYear &&
      appointmentDate.getMonth() === currentMonth
    ) {
      grouped['ThisMonth'].push(appointment);
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
    case 'ThisMonth':
      return 'Este Mes';
    default:
      return englishTitle;
  }
};

// --- Componente Principal ---

export default function CitasScreen() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const groupedAppointments = groupAppointments(allAppointments);
  
  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAllAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
