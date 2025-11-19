import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Reuniao } from '../../src/types/models';
import meetingService from '../../src/services/meetingService';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/styles/theme';
import { MeetingCard } from '../../src/components/MeetingCard';
import { Plus } from 'lucide-react-native';

export default function MeetingsScreen() {
  const [sections, setSections] = useState<{ title: string; data: Reuniao[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { usuario } = useAuth();
  const router = useRouter();

  const fetchMeetings = useCallback(async () => {
    if (!usuario) {
      setError('Usuário não autenticado.');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const allMeetings = await meetingService.getMeetings(); // Busca todas as reuniões
      const userMeetings = allMeetings.filter(m => m.usuarioId === usuario.id);

      // Ordena as reuniões pela data (mais recentes primeiro)
      userMeetings.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      const now = new Date();
      const upcomingMeetings = userMeetings.filter(m => new Date(m.data) >= now);
      const pastMeetings = userMeetings.filter(m => new Date(m.data) < now);

      const newSections = [];
      if (upcomingMeetings.length > 0) {
        newSections.push({ title: 'Próximas Reuniões', data: upcomingMeetings.reverse() }); // Reverte para mostrar a mais próxima primeiro
      }
      if (pastMeetings.length > 0) {
        newSections.push({ title: 'Reuniões Passadas', data: pastMeetings });
      }

      setSections(newSections);
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar as reuniões.');
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      fetchMeetings();
    }, [fetchMeetings])
  );

  const renderMeeting = ({ item }: { item: Reuniao }) => (
    <MeetingCard
      reuniao={item}
      onPress={() => router.push(`/meeting/${item.id}`)} // Navegará para detalhes da reunião
    />
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Text style={styles.emptyText}>Nenhuma reunião agendada.</Text>
          <Text style={styles.emptySubtext}>
            Clique no botão '+' para adicionar uma nova reunião.
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reuniões</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/meeting/new')} // Navegará para o formulário de criação
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderMeeting}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchMeetings} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  listContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.xs },
  emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
  errorText: { color: theme.colors.error, textAlign: 'center', marginTop: 20 },
});