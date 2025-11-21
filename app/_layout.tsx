import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useCallback, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import LoginScreen from '@/components/LoginScreen';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [booting, setBooting] = useState(true);
  const [authed, setAuthed] = useState(false);
  const onDone = useCallback(() => setBooting(false), []);
  const onLoginSuccess = useCallback(() => setAuthed(true), []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {booting ? (
        <LoadingScreen onDone={onDone} />
      ) : authed ? (
        <Stack screenOptions={{ animation: 'fade_from_bottom' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="citas" options={{ headerShown: false }} />
          <Stack.Screen name="citas/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="perfil" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      ) : (
        <LoginScreen onSuccess={onLoginSuccess} />
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
