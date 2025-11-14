import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import taskService from '../services/taskService';
import analyticsService from '../services/analyticsService';
import { Tarefa } from '../types/models';
import { Plus } from 'lucide-react-native';

export function TasksScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'TODOS' | 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDA'>('TODOS');

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      let data: Tarefa[];
      if (filter === 'TODOS') {
        data = await taskService.getTasks(usuario.id);
      } else {
        data = await taskService.getTasksByStatus(usuario.id, filter);
      }
      setTasks(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as tarefas');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (tarefa: Tarefa) => {
    if (!usuario) return;

    try {
      const newStatus = tarefa.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA';
      await taskService.updateTask(tarefa.id, { status: newStatus });

      if (newStatus === 'CONCLUIDA') {
        await analyticsService.createEvent({
          usuario_id: usuario.id,
          tarefa_id: tarefa.id,
          tipo_evento: 'TAREFA_CONCLUIDA',
          timestamp: new Date().toISOString(),
        });

        const metricsToday = await analyticsService.getTodayMetrics(usuario.id);
        await analyticsService.updateTodayMetrics(usuario.id, {
          tarefas_concluidas_no_dia: (metricsToday?.tarefas_concluidas_no_dia || 0) + 1,
        });
      }

      loadTasks();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa');
    }
  };

  const renderTask = ({ item }: { item: Tarefa }) => (
    <TaskCard
      tarefa={item}
      onPress={() => router.push(`/task/${item.id}`)}
      onComplete={() => handleCompleteTask(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
      <Text style={styles.emptySubtext}>
        Comece criando sua primeira tarefa
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/task/new')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {(['TODOS', 'PENDENTE', 'EM_PROGRESSO', 'CONCLUIDA'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.filterTextActive,
              ]}
            >
              {status === 'TODOS' ? 'Todas' : status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTasks} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
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
