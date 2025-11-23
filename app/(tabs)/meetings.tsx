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
  Platform,
  StatusBar,
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
      // Chamando o serviço que filtra por usuário no backend.
      const userMeetings = await meetingService.getMeetingsByUserId(usuario.id);

      const now = new Date();
      const upcomingMeetings = userMeetings.filter(m => new Date(m.data) >= now);
      const pastMeetings = userMeetings.filter(m => new Date(m.data) < now);

      const newSections = [];
      if (upcomingMeetings.length > 0) {
        // Ordena as próximas reuniões da mais próxima para a mais distante
        upcomingMeetings.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        newSections.push({ title: 'Próximas Reuniões', data: upcomingMeetings });
      }
      if (pastMeetings.length > 0) {
        // Ordena as reuniões passadas da mais recente para a mais antiga
        pastMeetings.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
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
      onPress={() => router.push(`/meeting/${item.id}`)}
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
          onPress={() => router.push('/meeting/new')} 
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderMeeting}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { flexGrow: 1}]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchMeetings} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
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