import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { FocusProvider } from '../src/contexts/FocusContext';
import { SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";

function RootLayoutNav() {

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="task/[id]" />
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Meu Perfil' }} />
        <Stack.Screen name="reports" options={{ headerShown: true, title: 'Gerar Relatório', presentation: 'modal' }} />
        <Stack.Screen name="report/[id]" options={{ headerShown: true, title: 'Detalhes do Relatório', presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
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
