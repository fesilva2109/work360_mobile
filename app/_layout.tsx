import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { theme } from '../src/styles/theme';
import { FocusProvider } from '../src/contexts/FocusContext';

function RootLayoutNav() {
  const { usuario, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Não faz nada enquanto a sessão está sendo carregada

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    if (usuario && inAuthGroup) {
      // Se o usuário está logado e tenta acessar uma tela de autenticação, redireciona para a home.
      router.replace('/(tabs)/meetings');
    } else if (!usuario && !inAuthGroup) {
      // Se o usuário não está logado e está fora do grupo de autenticação, redireciona para o login.
      router.replace('/login');
    }
  }, [usuario, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FocusProvider>
        <RootLayoutNav />
      </FocusProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});