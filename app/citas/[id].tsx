import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppointmentStatus } from '../../model/appoiments';
import { Appointment, getStatusColor, sampleAppointments } from '../../model/appoiments';
import { AppColors } from '@/constants/theme';

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
              <Ionicons name="chevron-back" size={22} color={AppColors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalles de la Cita</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="construct-outline" size={18} color={AppColors.textSecondary} /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Servicio a Realizar</Text><Text style={styles.infoValue}>{appointment.taskDescription}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="business-outline" size={18} color={AppColors.textSecondary} /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Cliente</Text><Text style={styles.infoValue}>{appointment.clientName}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="location-outline" size={18} color={AppColors.textSecondary} /></View>
              <View style={styles.infoText}><Text style={styles.infoLabel}>Dirección</Text><Text style={styles.infoValue}>{appointment.location}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="calendar-outline" size={18} color={AppColors.textSecondary} /></View>
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
                  <Ionicons name="image-outline" size={48} color={AppColors.textSecondary} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background, paddingHorizontal: 16, paddingVertical: 12, marginTop: Platform.OS === 'ios' ? 23: 8, },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: AppColors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { color: AppColors.textSecondary, fontSize: 14, marginTop: 6 },
  modalCard: { backgroundColor: AppColors.panel, borderRadius: 24, padding: 20, marginBottom: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
  headerBtnLeft: { position: 'absolute', left: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.background, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: AppColors.textPrimary, fontSize: 17, fontWeight: '700' },
  infoCard: { backgroundColor: AppColors.background, borderRadius: 16, padding: 16, gap: 16, marginBottom: 20, borderWidth: 1, borderColor: AppColors.border },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoIcon: { width: 32, alignItems: 'center', paddingTop: 2 },
  infoText: { flex: 1 },
  infoLabel: { color: AppColors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  infoValue: { color: AppColors.textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  stateValue: { fontSize: 14, fontWeight: '800' },
  primaryBtn: { backgroundColor: AppColors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: AppColors.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  secondaryBtnText: { color: AppColors.textPrimary, fontSize: 15, fontWeight: '800' },
  buttonDisabled: { opacity: 0.5 },
  timerWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8, backgroundColor: 'rgba(83, 200, 255, 0.1)', paddingVertical: 10, borderRadius: 12 },
  timerText: { color: AppColors.info, fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'] },
  evidenceCard: { marginTop: 24, borderTopWidth: 1, borderTopColor: AppColors.border, paddingTop: 20 },
  evidenceTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  evidenceSubtitle: { color: AppColors.textSecondary, fontSize: 13, marginBottom: 14 },
  evidenceImageWrap: { width: '100%', height: 200, backgroundColor: AppColors.background, borderRadius: 12, overflow: 'hidden', marginBottom: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border, borderStyle: 'dashed' },
  evidenceImage: { width: '100%', height: '100%' },
  evidencePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  updateBtn: { backgroundColor: AppColors.inputBg, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  updateBtnText: { color: AppColors.textPrimary, fontSize: 14, fontWeight: '700' },
});