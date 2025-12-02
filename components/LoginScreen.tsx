import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Animated, Easing, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { AppColors } from '@/constants/theme';

type Props = {
  onSuccess: () => void;
};

export default function LoginScreen({ onSuccess }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberLater, setRememberLater] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const accentScale = useRef(new Animated.Value(1)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(accentScale, { toValue: 1.1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(accentScale, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();
    Animated.timing(lineWidth, { toValue: 160, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [accentScale, lineWidth]);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('El correo es obligatorio');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Ingresa un correo válido');
      valid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (loading) return;
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await signIn(email, password);
      // onSuccess is technically not needed if we use isAuthenticated in RootLayout, but kept for compatibility
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      // Prioritize the backend message if available
      const msg = error.response?.data?.message 
        || error.message 
        || 'Error al iniciar sesión. Verifica tus credenciales.';
      
      if (Platform.OS === 'web') {
        window.alert(`Error de Inicio de Sesión: ${msg}`);
      } else {
        Alert.alert('Error de Inicio de Sesión', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>
            Conv<Animated.Text style={[styles.logoAccent, { transform: [{ scale: accentScale }] }]}>3</Animated.Text>rTech
          </Text>
          <Animated.View style={[styles.accentLine, { width: lineWidth }]} />
        </View>
        <View style={styles.card}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <View style={[styles.inputRow, emailError ? styles.inputError : null]}>
          <Ionicons name="mail" size={18} color={AppColors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Introduce tu correo"
            placeholderTextColor={AppColors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Text style={[styles.label, { marginTop: 14 }]}>Contraseña</Text>
        <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
          <Ionicons name="lock-closed" size={18} color={AppColors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Introduce tu contraseña"
            placeholderTextColor={AppColors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
          />
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <View style={styles.rememberRow}>
          <Text style={styles.rememberLabel}>Recordarme más tarde</Text>
          <Switch value={rememberLater} onValueChange={setRememberLater} trackColor={{ false: AppColors.inputBg, true: AppColors.inputBg }} thumbColor={rememberLater ? AppColors.gold : AppColors.textSecondary} />
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{loading ? 'Iniciando...' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  logoWrapper: { alignItems: 'center', marginBottom: 165, position: 'relative' },
  logo: { color: AppColors.textPrimary, fontSize: 50, fontWeight: '800', textAlign: 'center', letterSpacing: 0.6, textShadowColor: 'rgba(255,255,255,0.12)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  logoAccent: { color: AppColors.gold },
  accentLine: { height: 3, backgroundColor: AppColors.gold, borderRadius: 2, marginTop: 6 },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: AppColors.panel,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  label: { color: AppColors.textSecondary, fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.inputBg, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: AppColors.textPrimary, fontSize: 14 },
  rememberRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rememberLabel: { color: AppColors.textSecondary },
  button: { marginTop: 14, height: 46, borderRadius: 23, backgroundColor: AppColors.gold, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  forgot: { marginTop: 12, alignItems: 'center' },
  forgotText: { color: AppColors.textSecondary, fontSize: 12 },
  inputError: { borderColor: AppColors.error, borderWidth: 1 },
  errorText: { color: AppColors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
});