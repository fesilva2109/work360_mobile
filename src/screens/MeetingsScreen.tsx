import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MeetingCard } from '../components/MeetingCard';
import { theme } from '../styles/theme';
import meetingService from '../services/meetingService';
import { Reuniao } from '../types/models';
import { Plus } from 'lucide-react-native';

export function MeetingsScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [meetings, setMeetings] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMeetings = useCallback(async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      const data = await meetingService.getMeetings(usuario.id);
      setMeetings(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as reuniões');
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      loadMeetings();
    }, [loadMeetings])
  );

  const renderMeeting = ({ item }: { item: Reuniao }) => (
    <MeetingCard
      reuniao={item}
      onPress={() => router.push(`/meeting/${item.id}`)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma reunião agendada</Text>
      <Text style={styles.emptySubtext}>
        Crie uma nova reunião para começar
      </Text>
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

      <FlatList
        data={meetings}
        renderItem={renderMeeting}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadMeetings} />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});