import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppointmentStatus } from '../../model/appoiments';
import { Appointment, getStatusColor, sampleAppointments } from '../../model/appoiments';

const formatDateTime = (date: Date) => {
  const day = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const time = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} • ${time}`;
};

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const pad2 = (n: number) => n.toString().padStart(2, '0');
const formatDateEs = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
const formatTime12 = (d: Date) => {
  const h = d.getHours();
  const hh = pad2(h % 12 || 12);
  const mm = pad2(d.getMinutes());
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${hh}:${mm} ${ap}`;
};
const getStatusIcon = (s: AppointmentStatus) => {
  switch (s) {
    case 'Completado':
      return 'checkmark-circle-outline';
    case 'Cancelado':
      return 'close-circle-outline';
    default:
      return 'hourglass-outline';
  }
};
const formatHMS = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const appointment: Appointment | undefined = useMemo(() => {
    if (!id) return undefined;
    return sampleAppointments.find((item) => item.id === id);
  }, [id]);

  const statusColor = appointment ? getStatusColor(appointment.status) : '#999';
  const [arrivalMarked, setArrivalMarked] = useState(false);
  const [finishMarked, setFinishMarked] = useState(false);
  const [evidenceUri, setEvidenceUri] = useState<string | undefined>(undefined);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = React.useRef<number | null>(null);

  const handleTakePhoto = async () => {
    try {
      const ImagePicker: any = await import('expo-image-picker');
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status === 'granted') {
        const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (res && !res.canceled && res.assets && res.assets.length > 0) {
          setEvidenceUri(res.assets[0].uri);
          return;
        }
      }
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libPerm.status !== 'granted') return;
      const libRes = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (libRes && !libRes.canceled && libRes.assets && libRes.assets.length > 0) {
        setEvidenceUri(libRes.assets[0].uri);
      }
    } catch (e) {}
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!appointment ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF9800" />
          <Text style={styles.emptyTitle}>Cita no encontrada</Text>
          <Text style={styles.emptySubtitle}>Verifica que el identificador sea correcto.</Text>
        </View>
      ) : (
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtnLeft}>
              <Ionicons name="chevron-back" size={22} color={AppColors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalles de la Cita</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="construct-outline" size={18} color="#a3a3a3" /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Servicio a Realizar</Text><Text style={styles.infoValue}>{appointment.taskDescription}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="business-outline" size={18} color="#a3a3a3" /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Cliente</Text><Text style={styles.infoValue}>{appointment.clientName}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="location-outline" size={18} color="#a3a3a3" /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Dirección</Text><Text style={styles.infoValue}>{appointment.location}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="calendar-outline" size={18} color="#a3a3a3" /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Fecha y Hora</Text><Text style={styles.infoValue}>{formatDateEs(appointment.startTime)}, {formatTime12(appointment.startTime)}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name={getStatusIcon(appointment.status)} size={18} color={statusColor} /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Estado de la Cita</Text><Text style={[styles.stateValue,{ color: statusColor }]}>{appointment.status}</Text></View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, arrivalMarked && styles.buttonDisabled]}
            activeOpacity={0.9}
            disabled={arrivalMarked}
            onPress={() => {
              if (arrivalMarked) return;
              setArrivalMarked(true);
              setFinishMarked(false);
              setElapsedSec(0);
              const start = Date.now();
              if (timerRef.current == null) {
                // @ts-ignore
                timerRef.current = setInterval(() => {
                  setElapsedSec(Math.floor((Date.now() - start) / 1000));
                }, 1000);
              }
            }}
          >
            <Text style={styles.primaryBtnText}>{arrivalMarked ? 'Llegada marcada' : 'Marcar Hora de Llegada'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              (!arrivalMarked || finishMarked) && styles.buttonDisabled,
            ]}
            activeOpacity={0.9}
            disabled={!arrivalMarked || finishMarked}
            onPress={() => {
              if (!arrivalMarked || finishMarked) return;
              setFinishMarked(true);
              if (timerRef.current != null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }}
          >
            <Text style={styles.secondaryBtnText}>{finishMarked ? 'Finalización marcada' : 'Marcar Hora de Finalización'}</Text>
          </TouchableOpacity>

          {arrivalMarked && (
            <View style={styles.timerWrap}>
              <Ionicons name="time-outline" size={18} color="#53C8FF" />
              <Text style={styles.timerText}>{formatHMS(elapsedSec)}</Text>
            </View>
          )}

          <View style={styles.evidenceCard}>
            <Text style={styles.evidenceTitle}>Evidencia del Trabajo</Text>
            <Text style={styles.evidenceSubtitle}>Toma una foto del trabajo completado.</Text>
            <View style={styles.evidenceImageWrap}>
              {evidenceUri ? (
                <Image source={{ uri: evidenceUri }} style={styles.evidenceImage} contentFit="cover" />
              ) : (
                <View style={styles.evidencePlaceholder}>
                  <Ionicons name="image-outline" size={48} color="#a3a3a3" />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.updateBtn} activeOpacity={0.9} onPress={handleTakePhoto}>
              <Text style={styles.updateBtnText}>Tomar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const AppColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF', //color del texto
  textSecondary: 'rgba(255,255,255,0.7)', //Secundario
  divider: '#2C2C2C',//color divisor
  primary: '#c4bed4ff',//Primario
  secondaryBtn: '#2f2f2f',//Boton secundario
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
  },
  modalCard: {
    backgroundColor: '#242424',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginTop: Platform.OS === 'ios' ? 23: 8,
    height: Platform.OS === 'ios' ? 750 : 750,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 6,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#242424',
  },
  headerBtnLeft: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#242424',
    position: 'absolute',
    left: 0,
  },
  modalTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
  },
  infoText: { flex: 1 },
  infoLabel: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  infoValue: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  stateIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  stateValue: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: AppColors.text,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: AppColors.secondaryBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: AppColors.text,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  timerWrap: {
    marginTop: 10,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  timerText: {
    color: '#53C8FF',
    fontSize: 16,
    fontWeight: '700',
  },
  evidenceCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  evidenceTitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  evidenceSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  evidenceImageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#242424',
    height: 160,
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  evidencePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2f2f2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    color: AppColors.text,
    fontWeight: '600',
  },
  emptyTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
  },
});