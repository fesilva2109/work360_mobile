import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { theme } from '../src/styles/theme';

function AppLayout() {
  const { usuario, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';

    // Se o usuário não está logado e está tentando acessar uma tela protegida, redireciona para o login.
    if (!usuario && inTabsGroup) {
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
      <Stack.Screen name="reports" options={{ title: 'Gerar Relatório', presentation: 'modal' }} />
      <Stack.Screen name="report/[id]" options={{ title: 'Detalhes do Relatório' }} />
      <Stack.Screen name="profile" options={{ title: 'Meu Perfil' }} />
      <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider> 
        <AppLayout />
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