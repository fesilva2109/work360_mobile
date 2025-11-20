import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { theme } from '../src/styles/theme';
import { FocusProvider } from '../src/contexts/FocusContext';

/**
 * Componente que gerencia a navegação principal, decidindo se mostra
 * as telas do app ou a tela de login com base no estado de autenticação.
 */
function AppLayout() {
  const { usuario, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Aguarda o AuthContext terminar de carregar a sessão.
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

  // Após o carregamento, o Stack decide qual tela mostrar.
  // O Expo Router irá renderizar a tela correspondente à URL atual.
  // Se o usuário não estiver logado, ele será redirecionado pelo useEffect acima.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
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