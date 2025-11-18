import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import taskService from '../services/taskService';
import { Tarefa } from '../types/task.types';

type TaskStackNavigatorParams = {
  TaskDetail: { taskId: number };
  TaskForm: { taskId?: number };
};

type TaskDetailRouteProp = RouteProp<TaskStackNavigatorParams, 'TaskDetail'>;
type TaskDetailNavigationProp = NativeStackNavigationProp<TaskStackNavigatorParams, 'TaskDetail'>;

export function TaskDetailScreen() {
  const route = useRoute<TaskDetailRouteProp>();
  const navigation = useNavigation<TaskDetailNavigationProp>();
  const { taskId } = route.params;

  const [task, setTask] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTaskById(taskId);
        setTask(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes da tarefa:", error);
        Alert.alert("Erro", "Não foi possível carregar a tarefa.");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleDelete = async () => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir esta tarefa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            await taskService.deleteTask(taskId);
            Alert.alert("Sucesso", "Tarefa excluída.");
            navigation.goBack();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a tarefa.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!task) {
    return <Text style={styles.errorText}>Tarefa não encontrada.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.titulo}</Text>
      <Text style={styles.label}>Descrição:</Text>
      <Text style={styles.value}>{task.descricao || 'Nenhuma descrição'}</Text>
      <Text style={styles.label}>Prioridade:</Text>
      <Text style={styles.value}>{task.prioridade}</Text>
      <Text style={styles.label}>Estimativa (minutos):</Text>
      <Text style={styles.value}>{task.estimativaMinutos}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Editar" onPress={() => navigation.navigate('TaskForm', { taskId: task.id })} />
        <Button title="Excluir" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#666', marginTop: 15 },
  value: { fontSize: 16, marginBottom: 10 },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: 'red' },
  buttonContainer: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-around' },
});