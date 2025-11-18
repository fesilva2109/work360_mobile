import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  SectionList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { TaskCard } from '../../src/components/TaskCard';
import { theme } from '../../src/styles/theme';
import taskService from '../../src/services/taskService';
import analyticsService from '../../src/services/analyticsService';
import { Tarefa, UpdateTarefaDTO } from '../../src/types/models';
import { Plus } from 'lucide-react-native';

// Define os tipos de filtro baseados na prioridade
type PrioridadeFilter = 'TODAS' | 'ALTA' | 'MEDIA' | 'BAIXA';

export default function TasksScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [allTasks, setAllTasks] = useState<Tarefa[]>([]);
  // State to hold data structured for the SectionList
  const [taskSections, setTaskSections] = useState<
    { title: string; data: Tarefa[] }[]
  >([]);
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
      setTaskSections([]);
      return;
    }
    const myTasks = allTasks.filter(task => task.usuarioId == usuario.id);

    // Log de depuração para garantir que o filtro funciona como esperado
    if (allTasks.length > 0) {
      console.log(`[TasksScreen] Filtrando ${allTasks.length} tarefas para o usuário ID ${usuario.id}. Encontradas: ${myTasks.length}.`);
    }

    const tasksToDisplay =
      filter === 'TODAS'
        ? myTasks
        : myTasks.filter((task) => task.prioridade === filter);

    // Separa as tarefas em pendentes e concluídas
    const pendingTasks = tasksToDisplay.filter((task) => !task.concluida);
    const completedTasks = tasksToDisplay.filter((task) => task.concluida);

    const sections = [];
    if (pendingTasks.length > 0) {
      sections.push({ title: 'Pendentes', data: pendingTasks });
    }
    if (completedTasks.length > 0) {
      sections.push({ title: 'Concluídas', data: completedTasks });
    }

    setTaskSections(sections);
  }, [filter, allTasks, usuario]);

  const handleCompleteTask = async (tarefa: Tarefa) => {
    if (!usuario) return;

    // --- Atualização Otimista ---
    // 1. Salva o estado original para reverter em caso de erro.
    const originalTasks = [...allTasks];

    // 2. Atualiza o estado local imediatamente para um feedback visual instantâneo.
    const newTasks = allTasks.map((t) =>
      t.id === tarefa.id ? { ...t, concluida: !t.concluida } : t
    );
    setAllTasks(newTasks);

    try {
      // 3. Sincroniza com o backend em segundo plano.
      const taskToUpdate: UpdateTarefaDTO = {
        usuarioId: tarefa.usuarioId,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade,
        estimativaMinutos: tarefa.estimativaMinutos,
        concluida: !tarefa.concluida,
      };
      await taskService.updateTask(tarefa.id, taskToUpdate);
      // TODO: Enviar evento para o analytics
    } catch (error) {
      console.error('Erro ao concluir a tarefa:', error);
      // 4. Se a sincronização falhar, reverte a UI para o estado original.
      setAllTasks(originalTasks);
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa. Tente novamente.');
    }
  };

  const renderTask = ({ item }: { item: Tarefa }) => (
    <TaskCard
      tarefa={item}
      onPress={() => router.push(`/task/${item.id}`)}
      onComplete={() => handleCompleteTask(item)}
    />
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => <Text style={styles.sectionHeader}>{title}</Text>;

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
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          data={['TODAS', 'ALTA', 'MEDIA', 'BAIXA'] as const}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          keyExtractor={(item) => item}
          renderItem={({ item: prioridade }) => (
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
          )}
        />
      </View>

      <SectionList
        sections={taskSections}
        renderItem={renderTask}
        renderSectionHeader={renderSectionHeader}
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
  filterWrapper: {
    paddingBottom: theme.spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background, // Garante que o texto não fique sobreposto
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