import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import taskService from '../../src/services/taskService';
import { Tarefa } from '../../src/types/models';

// Tipagem para a navegação
type TaskStackNavigatorParams = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskForm: { taskId?: number };
};

type TaskListNavigationProp = NativeStackNavigationProp<TaskStackNavigatorParams, 'TaskList'>;

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<TaskListNavigationProp>();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega os dados toda vez que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const renderItem = ({ item }: { item: Tarefa }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}>
      <Text style={styles.itemTitle}>{item.titulo}</Text>
      <Text style={styles.itemPriority}>{item.prioridade}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Button title="Adicionar Tarefa" onPress={() => navigation.navigate('TaskForm', {})} />
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa encontrada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemPriority: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
    backgroundColor: '#6c757d', 
  },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});