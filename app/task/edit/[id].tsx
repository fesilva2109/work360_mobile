import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import taskService from '../../../src/services/taskService';
import { theme } from '../../../src/styles/theme';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Tarefa, UpdateTarefaDTO } from '../../../src/types/models';

function PrioritySelector({ selected, onSelect }: { selected: string, onSelect: (value: string) => void }) {
  const priorities = ['BAIXA', 'MEDIA', 'ALTA'];
  return (
    <View style={styles.priorityContainer}>
      {priorities.map(p => (
        <Button
          key={p}
          title={p}
          onPress={() => onSelect(p)}
          variant={selected === p ? 'primary' : 'outline'}
          style={styles.priorityButton}
        />
      ))}
    </View>
  );
}

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const taskId = Number(id);
  const { usuario } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [estimativa, setEstimativa] = useState('');
  const [loading, setLoading] = useState(true);
  const [originalTask, setOriginalTask] = useState<Tarefa | null>(null); 
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const task = await taskService.getTaskById(taskId);
        setOriginalTask(task);
        setTitulo(task.titulo);
        setDescricao(task.descricao || '');
        setPrioridade(task.prioridade);
        setEstimativa((task.estimativaMinutos / 60).toString()); 
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar a tarefa.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async () => {
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }
    if (!titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, insira um título para a tarefa.');
      return;
    }

    setIsSaving(true);
    try {
      const estimativaEmMinutos = estimativa ? Math.round(parseFloat(estimativa) * 60) : 0;

      const taskData: UpdateTarefaDTO = {
        usuarioId: usuario.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        prioridade: prioridade as 'ALTA' | 'MEDIA' | 'BAIXA',
        estimativaMinutos: estimativaEmMinutos,
        concluida: originalTask?.concluida || false, 
      };

      await taskService.updateTask(taskId, taskData);

      Alert.alert('Sucesso!', 'Tarefa atualizada.');
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Editar Tarefa', headerBackTitle: 'Voltar' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Título da Tarefa</Text>
          <Input value={titulo} onChangeText={setTitulo} />

          <Text style={styles.label}>Descrição (Opcional)</Text>
          <Input value={descricao} onChangeText={setDescricao} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} />

          <Text style={styles.label}>Prioridade</Text>
          <PrioritySelector selected={prioridade} onSelect={setPrioridade} />

          <Text style={styles.label}>Estimativa em horas (Opcional)</Text>
          <Input value={estimativa} onChangeText={setEstimativa} keyboardType="numeric" />

          <View style={styles.buttonContainer}>
            <Button title={isSaving ? 'Salvando...' : 'Salvar Alterações'} onPress={handleUpdateTask} disabled={isSaving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, flexGrow: 1 },
  label: { fontSize: 16, fontWeight: '500', color: theme.colors.text, marginBottom: theme.spacing.sm, marginTop: theme.spacing.md },
  priorityContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  priorityButton: { flex: 1, marginHorizontal: theme.spacing.xs },
  buttonContainer: { marginTop: 'auto', paddingTop: theme.spacing.lg },
});