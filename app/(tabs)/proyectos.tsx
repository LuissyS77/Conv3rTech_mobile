import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { AppColors } from '@/constants/theme';

type Project = {
  id: string;
  title: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'En Progreso' | 'Completado' | 'Pendiente' | 'Cancelado';
  client: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  coordinator: string;
};

const projects: Project[] = [
  {
    id: 'P-001',
    title: 'Desarrollo App Móvil',
    priority: 'Alta',
    status: 'En Progreso',
    client: 'Tech Solutions Inc.',
    description: 'Creación de una app nativa para iOS y Android para gestión de inventario.',
    progress: 75,
    startDate: '15/08/2024',
    endDate: '30/11/2024',
    coordinator: 'Ana Torres',
  },
  {
    id: 'P-002',
    title: 'Rediseño Web Corporativo',
    priority: 'Media',
    status: 'Completado',
    client: 'Global Imports Co.',
    description: 'Modernización del sitio web, optimización para SEO y experiencia de usuario.',
    progress: 100,
    startDate: '01/07/2024',
    endDate: '01/09/2024',
    coordinator: 'Carlos Ruiz',
  },
  {
    id: 'P-003',
    title: 'Migración a la Nube',
    priority: 'Baja',
    status: 'Pendiente',
    client: 'Innovatech Logistics',
    description: 'Migración de servicios a infraestructura cloud y automatización de despliegues.',
    progress: 35,
    startDate: '01/06/2024',
    endDate: '01/12/2024',
    coordinator: 'María López',
  },
  {
    id: 'P-004',
    title: 'Implementación de IA',
    priority: 'Alta',
    status: 'Cancelado',
    client: 'Smart Solutions Ltd.',
    description: 'Integración de IA para optimización de procesos y recomendaciones personalizadas.',
    progress: 0,
    startDate: '01/05/2024',
    endDate: '01/10/2024',
    coordinator: 'Luisa Fernández',
  },
];

function Chip({ label, tone }: { label: string; tone: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }) {
  const map = {
    blue: { bg: 'rgba(83, 200, 255, 0.18)', fg: '#53C8FF', br: '#53C8FF' },
    green: { bg: 'rgba(76, 175, 80, 0.20)', fg: '#4CAF50', br: '#4CAF50' },
    yellow: { bg: 'rgba(255, 193, 7, 0.20)', fg: '#FFC107', br: '#FFC107' },
    red: { bg: 'rgba(244, 67, 54, 0.20)', fg: '#F44336', br: '#F44336' },
    gray: { bg: 'rgba(255,255,255,0.12)', fg: 'rgba(255,255,255,0.80)', br: 'rgba(255,255,255,0.24)' },
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
  const statusTone = p.status === 'Completado' ? 'green' : p.status === 'En Progreso' ? 'gray' : p.status === 'Cancelado' ? 'red' : 'yellow';
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
  return (
    <View style={styles.container}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Buscar proyectos</Text>
        <Ionicons name="search" size={18} color={AppColors.textPrimary} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {projects.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: AppColors.panel, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 16, marginTop: 0, marginBottom: 16, borderRadius: 12 },
  panelTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '700' },
  content: { paddingHorizontal: 10, paddingBottom: 140 },
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
});