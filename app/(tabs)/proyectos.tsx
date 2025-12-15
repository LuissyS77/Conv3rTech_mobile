import React, { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, Platform, RefreshControl, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

type Project = {
  id: string;
  title: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En Progreso' | 'En Pausa' | 'Completado' | 'Cancelado';
  client: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  coordinator: string;
  coordinatorId?: number | null;
  assignedUserIds?: number[];
};

function Chip({ label, tone }: { label: string; tone: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }) {
  const map = {
    blue: { bg: 'rgba(83, 200, 255, 0.18)', fg: '#53C8FF', br: '#53C8FF' },
    green: { bg: 'rgba(76, 175, 80, 0.20)', fg: '#4CAF50', br: '#4CAF50' },
    yellow: { bg: 'rgba(255, 193, 7, 0.20)', fg: '#FFC107', br: '#FFC107' },
    red: { bg: 'rgba(244, 67, 54, 0.20)', fg: '#F44336', br: '#F44336' },
    gray: { bg: 'rgba(148, 163, 184, 0.18)', fg: AppColors.textPrimary, br: 'rgba(148, 163, 184, 0.8)' },
  } as const;
  const c = map[tone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg, borderColor: c.br }]}> 
      <Text style={[styles.chipText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const priorityTone = p.priority === 'Alta' ? 'blue' : p.priority === 'Media' ? 'gray' : 'red';
  const statusTone =
    p.status === 'Completado'
      ? 'green'
      : p.status === 'En Progreso'
      ? 'gray'
      : p.status === 'En Pausa'
      ? 'yellow'
      : p.status === 'Cancelado'
      ? 'red'
      : 'yellow';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{p.title}</Text>
        <Text style={styles.cardCode}>{p.id}</Text>
      </View>
      <View style={styles.chipsRow}>
        <Chip label={`Prioridad ${p.priority}`} tone={priorityTone} />
        <Chip label={p.status} tone={statusTone} />
      </View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Cliente:</Text><Text style={styles.infoValue}>{p.client}</Text></View>
      <Text style={styles.description}>{p.description}</Text>
      <View style={styles.progressRow}>
        <Text style={styles.infoLabel}>Progreso</Text>
        <Text style={styles.progressPct}>{`${p.progress}%`}</Text>
      </View>
      <ProgressBar value={p.progress} />
      <View style={styles.gridRow}>
        <View style={styles.gridCol}><Text style={styles.infoLabel}>Fecha Inicio</Text><Text style={styles.infoValue}>{p.startDate}</Text></View>
        <View style={styles.gridCol}><Text style={styles.infoLabel}>Fecha Fin</Text><Text style={styles.infoValue}>{p.endDate}</Text></View>
      </View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Coordinador</Text><Text style={styles.infoValue}>{p.coordinator}</Text></View>
    </View>
  );
}

export default function ProyectScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const data = response.data?.data || [];
      const mapped: Project[] = data.map((item: any) => {
        const priorityValue =
          item.prioridad === 'Alta' || item.prioridad === 'Media' || item.prioridad === 'Baja'
            ? item.prioridad
            : 'Media';
        const statusValue =
          item.estado === 'Pendiente' ||
          item.estado === 'En Progreso' ||
          item.estado === 'En Pausa' ||
          item.estado === 'Completado' ||
          item.estado === 'Cancelado'
            ? item.estado
            : 'Pendiente';

        const coordinatorId =
          typeof item.responsable?.id === 'number' ? item.responsable.id : null;

        const assignedUserIds: number[] = Array.isArray(item.empleadosAsociados)
          ? item.empleadosAsociados
              .map((emp: any) => emp?.id)
              .filter((id: any) => typeof id === 'number')
          : [];

        return {
          id: item.id?.toString() ?? '',
          title: item.nombre || 'Proyecto sin nombre',
          priority: priorityValue,
          status: statusValue,
          client: item.cliente || 'Cliente no encontrado',
          description: item.descripcion || 'Sin descripción',
          progress: typeof item.progreso === 'number' ? item.progreso : Number(item.progreso ?? 0),
          startDate: item.fechaInicio || '',
          endDate: item.fechaFin || '',
          coordinator: item.responsable?.nombre || 'Sin asignar',
          coordinatorId,
          assignedUserIds,
        };
      });
      setProjects(mapped);
    } catch (error) {
      console.error('Error al obtener proyectos', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const visibleProjects = useMemo(() => {
    if (!user) return projects;
    const userId = user.id_usuario;
    return projects.filter((p) => {
      if (p.coordinatorId === userId) return true;
      if (p.assignedUserIds && p.assignedUserIds.includes(userId)) return true;
      return false;
    });
  }, [projects, user]);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const base = visibleProjects;
    if (!term) return base;
    return base.filter((p) => {
      const title = p.title?.toLowerCase() || '';
      const client = p.client?.toLowerCase() || '';
      const coordinator = p.coordinator?.toLowerCase() || '';
      return (
        title.includes(term) ||
        client.includes(term) ||
        coordinator.includes(term)
      );
    });
  }, [projects, searchTerm]);

  return (
    <View style={styles.container}>
      <View style={styles.panelHeader}>
        <Ionicons name="search" size={18} color={AppColors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por proyecto o cliente"
          placeholderTextColor={AppColors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {visibleProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={42} color={AppColors.textSecondary} />
            <Text style={styles.emptyTitle}>No tienes proyectos asignados</Text>
            <Text style={styles.emptySubtitle}>
              Cuando te asignen un proyecto, aparecerá aquí.
            </Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color={AppColors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySubtitle}>
              No encontramos proyectos que coincidan con tu búsqueda.
            </Text>
          </View>
        ) : (
          filteredProjects.map((p) => <ProjectCard key={p.id} p={p} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.panel, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginTop: 0, marginBottom: 16, borderRadius: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: AppColors.textPrimary, fontSize: 14, paddingVertical: 4 },
  content: { paddingHorizontal: 10, paddingBottom: 140, flexGrow: 1 },
  card: { backgroundColor: AppColors.panel, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: AppColors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '800' },
  cardCode: { color: AppColors.textSecondary, fontSize: 12, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 3 },
  infoLabel: { color: AppColors.textSecondary, fontSize: 13, fontWeight: '700' },
  infoValue: { color: AppColors.textPrimary, fontSize: 13, fontWeight: '600' },
  description: { color: AppColors.textSecondary, fontSize: 13, marginTop: 6 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  progressPct: { color: AppColors.info, fontWeight: '800', },
  progressTrack: { height: 6, backgroundColor: AppColors.border, borderRadius: 999, overflow: 'hidden', marginTop: 2 },
  progressFill: { height: 6, backgroundColor: AppColors.info  },
  gridRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  gridCol: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 40 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '700', color: AppColors.textPrimary, textAlign: 'center' },
  emptySubtitle: { marginTop: 6, fontSize: 13, color: AppColors.textSecondary, textAlign: 'center' },
});
