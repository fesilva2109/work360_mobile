import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import taskService from '../../src/services/taskService';
import { useAuth } from '../../src/contexts/AuthContext';
import { Prioridade } from '../../src/types/models';

type TaskStackNavigatorParams = {
  TaskForm: { taskId?: number };
};

type TaskFormRouteProp = RouteProp<TaskStackNavigatorParams, 'TaskForm'>;

export default function TaskFormScreen() {
  const route = useRoute<TaskFormRouteProp>();
  const navigation = useNavigation();
  const { usuario } = useAuth();

  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('MEDIA');
  const [estimativaMinutos, setEstimativaMinutos] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Tarefa' : 'Nova Tarefa' });

    if (isEditing) {
      setLoading(true);
      taskService.getTaskById(taskId)
        .then(task => {
          setTitulo(task.titulo);
          setDescricao(task.descricao || '');
          setPrioridade(task.prioridade);
          setEstimativaMinutos(task.estimativaMinutos.toString());
        })
        .catch(() => Alert.alert("Erro", "Não foi possível carregar os dados da tarefa."))
        .finally(() => setLoading(false));
    }
  }, [isEditing, taskId, navigation]);

  const handleSubmit = async () => {
    if (!titulo || !estimativaMinutos) {
      Alert.alert("Erro", "Título e Estimativa são obrigatórios.");
      return;
    }
    if (!usuario) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await taskService.updateTask(taskId, {
          titulo,
          descricao,
          prioridade,
          estimativaMinutos: parseInt(estimativaMinutos, 10),
        });
        Alert.alert("Sucesso", "Tarefa atualizada!");
      } else {
        // Passa o ID do usuário e os dados da tarefa separadamente
        await taskService.createTask({
          usuarioId: usuario.id,          titulo,
          descricao,
          prioridade,
          estimativaMinutos: parseInt(estimativaMinutos, 10),
        });
        Alert.alert("Sucesso", "Tarefa criada!");
      }
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tente novamente mais tarde.';
      Alert.alert("Erro ao Salvar", `Não foi possível salvar a tarefa. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Descrição (Opcional)</Text>
      <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} multiline />

      <Text style={styles.label}>Estimativa (minutos)</Text>
      <TextInput style={styles.input} value={estimativaMinutos} onChangeText={setEstimativaMinutos} keyboardType="numeric" />

      <Text style={styles.label}>Prioridade</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={prioridade} onValueChange={(itemValue: Prioridade) => setPrioridade(itemValue)}>
          <Picker.Item label="Baixa" value="BAIXA" />
          <Picker.Item label="Média" value="MEDIA" />
          <Picker.Item label="Alta" value="ALTA" />
        </Picker>
      </View>

      <Button title={loading ? "Salvando..." : "Salvar Tarefa"} onPress={handleSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
});