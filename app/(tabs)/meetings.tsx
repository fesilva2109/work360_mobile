import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Reuniao } from '../../src/types/models';
import meetingService from '../../src/services/meetingService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchMeetings = useCallback(async () => {
    if (!user) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      // Usando getMeetingsByUserId para simplicidade, poderia ser getMeetings()
      const data = await meetingService.getMeetingsByUserId(user.id);
      setMeetings(data);
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar as reuniões.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeetings().finally(() => setRefreshing(false));
  }, [fetchMeetings]);

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  const renderItem = ({ item }: { item: Reuniao }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.titulo}</Text>
      <Text>{item.descricao}</Text>
      <Text style={styles.itemDate}>
        {new Date(item.data).toLocaleString('pt-BR')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={meetings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>Nenhuma reunião encontrada.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  itemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  itemDate: { fontSize: 12, color: '#666', marginTop: 8 },
});