import { Tabs, useRouter } from 'expo-router';
import { Home, CheckSquare, Calendar, TrendingUp, User, Zap } from 'lucide-react-native';
import { theme } from '../../src/styles/theme';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1, 
          borderTopColor: theme.colors.border,
          height: 75, 
          paddingBottom: 5, 
          paddingTop: 5, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: '',
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.focusButtonContainer}
              onPress={() => router.push('/focus')}
            >
              <View style={styles.focusButton}>
                <Zap size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Reuniões',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  focusButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  focusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20, 
    ...theme.shadows.large,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
});
