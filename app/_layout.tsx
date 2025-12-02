import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useCallback, useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import LoginScreen from '@/components/LoginScreen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  const [booting, setBooting] = useState(true);

  const onDone = useCallback(() => setBooting(false), []);

  // Mientras carga el auth o la pantalla de carga inicial
  if (loading) {
    return <LoadingScreen onDone={() => {}} />; // O un spinner simple
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {booting ? (
        <LoadingScreen onDone={onDone} />
      ) : isAuthenticated ? (
        <Stack screenOptions={{ animation: 'fade_from_bottom' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="citas" options={{ headerShown: false }} />
          <Stack.Screen name="citas/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="perfil" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      ) : (
        <LoginScreen onSuccess={() => {}} />
      )}
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
