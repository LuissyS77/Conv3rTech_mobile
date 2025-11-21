import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Animated, Easing, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onSuccess: () => void;
};

export default function LoginScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberLater, setRememberLater] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    onSuccess();
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
        <View style={styles.inputRow}>
          <Ionicons name="mail" size={18} color="#8a8a8a" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Introduce tu correo"
            placeholderTextColor="#8a8a8a"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={[styles.label, { marginTop: 14 }]}>Contraseña</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={18} color="#8a8a8a" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Introduce tu contraseña"
            placeholderTextColor="#8a8a8a"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.rememberRow}>
          <Text style={styles.rememberLabel}>Recordarme más tarde</Text>
          <Switch value={rememberLater} onValueChange={setRememberLater} trackColor={{ false: '#2f2f2f', true: '#2f2f2f' }} thumbColor={rememberLater ? '#ffcc00' : '#a3a3a3'} />
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} activeOpacity={0.9} onPress={handleLogin}>
          <Text style={styles.buttonText}>{loading ? 'Cargando…' : 'Iniciar Sesión'}</Text>
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
  container: { flex: 1, backgroundColor: '#0c0c0c', paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  logoWrapper: { alignItems: 'center', marginBottom: 165, position: 'relative' },
  logo: { color: '#ffffff', fontSize: 50, fontWeight: '800', textAlign: 'center', letterSpacing: 0.6, textShadowColor: 'rgba(255,255,255,0.12)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  logoAccent: { color: '#ffcc00' },
  accentLine: { height: 3, backgroundColor: '#ffcc00', borderRadius: 2, marginTop: 6 },
  card: { width: '100%', maxWidth: 380, backgroundColor: '#161616', borderRadius: 16, padding: 16, gap: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  label: { color: '#d7d7d7', fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#242424', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: '#ffffff', fontSize: 14 },
  rememberRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rememberLabel: { color: '#a3a3a3' },
  button: { marginTop: 14, height: 46, borderRadius: 23, backgroundColor: '#4DA7FF', alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  forgot: { marginTop: 12, alignItems: 'center' },
  forgotText: { color: '#a3a3a3', fontSize: 12 },
});