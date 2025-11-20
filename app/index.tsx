import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../src/styles/theme';
import React from 'react';

export default function Index() {
  // Correção: usar 'usuario' em vez de 'isAuthenticated'
  const { usuario, isLoading } = useAuth();

  // Enquanto o AuthContext verifica a sessão, mostramos um indicador de carregamento.
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  // Após o carregamento, se o objeto 'usuario' existir, o usuário está autenticado.
  if (usuario) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
