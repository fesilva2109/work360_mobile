import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { User } from 'lucide-react-native';

import { DashboardScreen } from '@/src/screens/DashboardScreen';
import { theme } from '@/src/styles/theme';
import { useAuth } from '@/src/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { usuario } = useAuth();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Olá, ${usuario?.nome?.split(' ')[0] || ''}!`, // Saudação personalizada
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <View style={{ backgroundColor: theme.colors.primary, padding: 8, borderRadius: 20 }}>
                <User size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <DashboardScreen />
    </>
  );
}
