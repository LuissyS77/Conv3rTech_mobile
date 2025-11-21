// app/(tabs)/perfil.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

type User = {
  firstName: string;
  lastName: string;
  role: string;
  documentType: string;
  documentNumber: string;
  email: string;
};

async function fetchUserProfile(): Promise<User> {
  try {
    const base = process.env.EXPO_PUBLIC_API_URL || '';
    const res = await fetch(`${base}/api/user/me`);
    if (res.ok) {
      const json = await res.json();
      return {
        firstName: json.firstName ?? 'Ana',
        lastName: json.lastName ?? 'Torres',
        role: json.role ?? 'Coordinadora',
        documentType: json.documentType ?? 'CC',
        documentNumber: json.documentNumber ?? '1023456789',
        email: json.email ?? 'ana.torres@empresa.com',
      };
    }
  } catch {}
  return {
    firstName: 'Ana',
    lastName: 'Torres',
    role: 'Coordinadora',
    documentType: 'CC',
    documentNumber: '1023456789',
    email: 'ana.torres@empresa.com',
  };
}

function initials(first: string, last: string) {
  const a = first?.trim()?.[0] ?? '';
  const b = last?.trim()?.[0] ?? '';
  return `${a}${b}`.toUpperCase();
}

export default function PerfilScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserProfile().then((u) => {
      setUser(u);
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setDocumentType(u.documentType);
      setDocumentNumber(u.documentNumber);
      setEmail(u.email);
    });
  }, []);

  const letters = useMemo(() => initials(firstName, lastName), [firstName, lastName]);

  const onSave = () => {
    console.log('Guardar', { firstName, lastName, documentType, documentNumber, email, newPassword });
  };
  const onLogout = () => {
    console.log('Cerrar sesión');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarBtnLeft} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={AppColors.text} />
          </TouchableOpacity>
          <Text style={styles.toolbarTitle}>Editar Perfil</Text>
          <TouchableOpacity style={styles.toolbarBtnRight} onPress={onSave}>
            <Ionicons name="pencil" size={18} color={AppColors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{letters}</Text>
          </View>
          <Text style={styles.headerName}>{`${firstName} ${lastName}`}</Text>
          <Text style={styles.headerRole}>{user?.role ?? ''}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Tipo de Documento</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>{documentType}</Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Número de Documento</Text>
            <View style={styles.input}>
              <TextInput value={documentNumber} onChangeText={setDocumentNumber} style={styles.inputText} keyboardType="number-pad" />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <View style={styles.input}>
              <TextInput value={firstName} onChangeText={setFirstName} style={styles.inputText} />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Apellido</Text>
            <View style={styles.input}>
              <TextInput value={lastName} onChangeText={setLastName} style={styles.inputText} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Cuenta</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Correo Electrónico</Text>
            <View style={styles.input}>
              <TextInput value={email} onChangeText={setEmail} style={styles.inputText} keyboardType="email-address" />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Cambiar Contraseña</Text>
            <View style={styles.input}>
              <TextInput value={newPassword} onChangeText={setNewPassword} style={styles.inputText} secureTextEntry />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSave} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Guardar Cambios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onLogout} activeOpacity={0.9}>
          <Text style={styles.secondaryBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const AppColors = {
  background: '#121212',
  panel: '#161616',
  card: '#242424',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.70)',
  border: 'rgba(255,255,255,0.14)',
  accent: '#2a27caff',
  inputBg: '#1E1E1E',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background, marginTop: Platform.OS === 'ios' ? 23: 8, },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingVertical: 6, marginBottom: 8 },
  toolbarTitle: { color: AppColors.text, fontSize: 16, fontWeight: '800' },
  toolbarBtnLeft: { position: 'absolute', left: 0, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: AppColors.panel },
  toolbarBtnRight: { position: 'absolute', right: 0, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: AppColors.panel },
  headerCard: { backgroundColor: AppColors.panel, borderRadius: 16, alignItems: 'center', paddingVertical: 18, marginBottom: 12 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(42,39,202,0.18)', borderWidth: 2, borderColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: AppColors.accent, fontSize: 28, fontWeight: '800' },
  headerName: { color: AppColors.text, fontSize: 18, fontWeight: '800', marginTop: 10 },
  headerRole: { color: AppColors.textSecondary, fontSize: 13 },
  section: { backgroundColor: AppColors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: AppColors.border },
  sectionTitle: { color: AppColors.text, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  fieldRow: { marginBottom: 10 },
  fieldLabel: { color: AppColors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: AppColors.inputBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  inputText: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  primaryBtn: { backgroundColor: '#53C8FF', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#001', fontSize: 14, fontWeight: '800' },
  secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: AppColors.border, borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  secondaryBtnText: { color: AppColors.text, fontSize: 14, fontWeight: '800' },
});