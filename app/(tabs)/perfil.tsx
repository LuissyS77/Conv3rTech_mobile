// app/(tabs)/perfil.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { AppColors } from '@/constants/theme';

function initials(first: string, last: string) {
  const a = first?.trim()?.[0] ?? '';
  const b = last?.trim()?.[0] ?? '';
  return `${a}${b}`.toUpperCase();
}

export default function PerfilScreen() {
  const router = useRouter();
  const { user, signOut, signIn } = useAuth(); // We might need to refresh user in context
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.nombre || '');
      setLastName(user.apellido || '');
      setDocumentType(user.tipoDocumento || '');
      setDocumentNumber(user.documento || '');
      setEmail(user.email || '');
      setCellphone(user.celular || '');
    }
  }, [user]);

  const letters = useMemo(() => initials(firstName, lastName), [firstName, lastName]);

  const onSave = async () => {
    try {
      // Update profile
      await authService.updateProfile({
        nombre: firstName,
        apellido: lastName,
        email: email,
        celular: cellphone,
        documento: documentNumber,
        tipoDocumento: documentType,
      });

      // Change password if provided
      if (newPassword) {
        if (!currentPassword) {
          Alert.alert('Error', 'Para cambiar la contraseña debes ingresar tu contraseña actual.');
          return;
        }
        await authService.changePassword(currentPassword, newPassword);
        setNewPassword('');
        setCurrentPassword('');
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      // Optionally refresh user data in context (could add a refresh method to context)
      // For now, we rely on next fetch or restart, or we can trigger a reload if we expose it.
      // Actually, `signIn` updates the user. We might want a `refreshUser` in context.
    } catch (error: any) {
      console.error('Update error:', error);
      const msg = error.response?.data?.message || 'Error al actualizar perfil.';
      Alert.alert('Error', msg);
    }
  };

  const onLogout = async () => {
    try {
      await signOut();
      // router.replace('/'); // Handled by RootLayout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarBtnLeft} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={AppColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.toolbarTitle}>Editar Perfil</Text>
          <TouchableOpacity style={styles.toolbarBtnRight} onPress={onSave}>
            <Ionicons name="pencil" size={18} color={AppColors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{letters}</Text>
          </View>
          <Text style={styles.headerName}>{`${firstName} ${lastName}`}</Text>
          <Text style={styles.headerRole}>{user?.rol ?? ''}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Tipo de Documento</Text>
            <View style={styles.input}>
              <TextInput value={documentType} onChangeText={setDocumentType} style={styles.inputText} />
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
          
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Celular</Text>
            <View style={styles.input}>
              <TextInput value={cellphone} onChangeText={setCellphone} style={styles.inputText} keyboardType="phone-pad" />
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
            <Text style={styles.fieldLabel}>Contraseña Actual</Text>
            <View style={styles.input}>
              <TextInput 
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
                style={styles.inputText} 
                secureTextEntry 
                placeholder="Requerido para cambiar contraseña"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nueva Contraseña</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background, marginTop: Platform.OS === 'ios' ? 23: 8, },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingVertical: 6, marginBottom: 8 },
  toolbarTitle: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '800' },
  toolbarBtnLeft: { position: 'absolute', left: 0, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: AppColors.panel },
  toolbarBtnRight: { position: 'absolute', right: 0, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: AppColors.panel },
  headerCard: { backgroundColor: AppColors.panel, borderRadius: 16, alignItems: 'center', paddingVertical: 18, marginBottom: 12 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255, 179, 0, 0.18)', borderWidth: 2, borderColor: AppColors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: AppColors.gold, fontSize: 28, fontWeight: '800' },
  headerName: { color: AppColors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 10 },
  headerRole: { color: AppColors.textSecondary, fontSize: 13 },
  section: { backgroundColor: AppColors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: AppColors.border },
  sectionTitle: { color: AppColors.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  fieldRow: { marginBottom: 10 },
  fieldLabel: { color: AppColors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: AppColors.inputBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  inputText: { color: AppColors.textPrimary, fontSize: 14, fontWeight: '600' },
  primaryBtn: { backgroundColor: AppColors.gold, borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: AppColors.border, borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  secondaryBtnText: { color: AppColors.textPrimary, fontSize: 14, fontWeight: '800' },
});
