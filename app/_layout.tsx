import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { FocusProvider } from '../src/contexts/FocusContext';
import React from "react";

function RootLayoutNav() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task/[id]" />
      <Stack.Screen name="profile" options={{ headerShown: true, title: 'Meu Perfil' }} />
      <Stack.Screen name="reports" options={{ headerShown: true, title: 'Gerar Relatório', presentation: 'modal' }} />
      <Stack.Screen name="report/[id]" options={{ headerShown: true, title: 'Detalhes do Relatório', presentation: 'modal' }} />
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
