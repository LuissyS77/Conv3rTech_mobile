// components/AppointmentCard.tsx

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { Appointment, getStatusColor } from "../model/appoiments";

// Helper para formato de hora (similar al de Flutter)
const formatTime = (time: Date): string => {
  const hour = time.getHours() % 12 || 12;
  const ampm = time.getHours() >= 12 ? "PM" : "AM";
  const minute = time.getMinutes().toString().padStart(2, "0");
  return `${hour}:${minute} ${ampm}`;
};

const MONTHS = [
  'enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'
];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatDateEs = (d: Date): string => {
  const day = d.getDate();
  const month = capitalize(MONTHS[d.getMonth()]);
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

interface AppointmentCardProps {
    appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const statusColor = getStatusColor(appointment.status);
  const router = useRouter();

  const handlePress = () => {
    router.push(`/citas/${appointment.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.card}>
      <View style={[styles.accent, { backgroundColor: statusColor }]} />
      <View style={styles.body}>
        <Text style={styles.subtitle}>{appointment.taskDescription}</Text>
        <Text style={styles.location}>{appointment.location}</Text>
        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={16} color="#53C8FF" style={styles.footerIcon} />
            <Text style={styles.footerText}>{formatDateEs(appointment.startTime)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color="#53C8FF" style={styles.footerIcon} />
            <Text style={styles.footerText}>{formatTime(appointment.startTime)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ... (Estilos y AppColors) ...

// --- Estilos de la Tarjeta ---

const AppColors = {
  card: "#242424",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textTertiary: "rgba(255, 255, 255, 0.54)",
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 18,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 6,
  },
  location: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 6,
  },
  footerText: {
    color: '#53C8FF',
    fontSize: 13,
    fontWeight: '600',
  },
});
