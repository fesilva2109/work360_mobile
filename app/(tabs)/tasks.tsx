import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { TaskCard } from '../../src/components/TaskCard';
import { theme } from '../../src/styles/theme';
import taskService from '../../src/services/taskService';
import analyticsService from '../../src/services/analyticsService';
import { Tarefa } from '../../src/types/models';
import { Plus } from 'lucide-react-native';

// Define os tipos de filtro baseados na prioridade
type PrioridadeFilter = 'TODAS' | 'ALTA' | 'MEDIA' | 'BAIXA';

export default function TasksScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [allTasks, setAllTasks] = useState<Tarefa[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<PrioridadeFilter>('TODAS');

  const loadTasks = useCallback(async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      const data = await taskService.getTasks();
      setAllTasks(data);
    } catch (error) {
      console.error('Erro ao carregar as tarefas:', error);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!usuario) {
      setFilteredTasks([]);
      return;
    }
    // WORKAROUND: Filtro no cliente para previnir o erro 403.
    // O ideal é que o backend retorne apenas as tarefas do usuário logado.
    // A comparação é feita com '==' para evitar problemas de tipo (string vs number)
    // que podem vir da API, garantindo que '5' == 5 seja verdadeiro.
    const myTasks = allTasks.filter(task => task.usuarioId == usuario.id);

    // Log de depuração para garantir que o filtro funciona como esperado
    if (allTasks.length > 0) {
      console.log(`[TasksScreen] Filtrando ${allTasks.length} tarefas para o usuário ID ${usuario.id}. Encontradas: ${myTasks.length}.`);
    }

    if (filter === 'TODAS') {
      setFilteredTasks(myTasks);
    } else {
      const filtered = myTasks.filter((task) => task.prioridade === filter);
      setFilteredTasks(filtered);
    }
  }, [filter, allTasks, usuario]);

  const handleCompleteTask = async (tarefa: Tarefa) => {
    if (!usuario) return;

    try {
      // 1. Altera o status da tarefa para o inverso do atual (concluir/desconcluir)
      await taskService.updateTask(tarefa.id, { concluida: !tarefa.concluida });

      // TODO: Enviar evento para o analytics

      // 2. Recarrega as tarefas para atualizar a UI
      await loadTasks();
    } catch (error) {
      console.error('Erro ao concluir a tarefa:', error);
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
        {filter === 'TODAS'
          ? 'Comece criando sua primeira tarefa'
          : `Não há tarefas com prioridade ${filter.toLowerCase()}`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/task/new')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filtro por Prioridade */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {(['TODAS', 'ALTA', 'MEDIA', 'BAIXA'] as const).map((prioridade) => (
            <TouchableOpacity
              key={prioridade}
              style={[
                styles.filterButton,
                filter === prioridade && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(prioridade)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === prioridade && styles.filterTextActive,
                ]}
              >
                {prioridade.charAt(0) + prioridade.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTasks} />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
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
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
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