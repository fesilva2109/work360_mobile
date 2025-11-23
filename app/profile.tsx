import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { theme } from '../src/styles/theme';
import { useRouter, Stack } from 'expo-router';
import { User, Mail, LogOut } from 'lucide-react-native';
import React from 'react';

export default function ProfileScreen() {
  const { usuario, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Meu Perfil', headerBackTitle: 'Voltar' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.name}>{usuario?.nome}</Text>
          <Text style={styles.email}>{usuario?.email}</Text>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <User size={20} color={theme.colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{usuario?.nome}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Mail size={20} color={theme.colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{usuario?.email}</Text>
            </View>
          </View>
        </Card>

        <TouchableOpacity onPress={() => router.push('/about')}>
          <Text style={styles.aboutLink}>Sobre o App</Text>
        </TouchableOpacity>

        <Button
          title="Sair"
          variant="danger"
          onPress={handleLogout}
          fullWidth
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoCard: {
    marginBottom: theme.spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  logoutButton: {
    marginTop: theme.spacing.lg,
  },
  aboutLink: {
    color: theme.colors.primary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    fontWeight: '500',
  },
});
