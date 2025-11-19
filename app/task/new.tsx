import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import taskService from '../../src/services/taskService';
import { theme } from '../../src/styles/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

// Futuramente, este componente pode ser um seletor mais robusto (Picker)
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

export default function NewTaskScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [estimativa, setEstimativa] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }
    if (!titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, insira um título para a tarefa.');
      return;
    }

    setLoading(true);
    try {
      // Convertendo horas (ex: 1.5) para minutos (90)
      const estimativaEmMinutos = estimativa ? Math.round(parseFloat(estimativa) * 60) : 0;

      await taskService.createTask({
        usuarioId: usuario.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        prioridade: prioridade as 'ALTA' | 'MEDIA' | 'BAIXA',
        // A API espera 'estimativaMinutos' conforme a especificação
        estimativaMinutos: estimativaEmMinutos,
      });

      Alert.alert('Sucesso!', 'Sua nova tarefa foi criada.');
      // `replace` é usado para que o usuário não volte para o formulário ao pressionar "voltar"
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível criar a tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Nova Tarefa', headerBackTitle: 'Voltar' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Título da Tarefa</Text>
          <Input
            placeholder="Ex: Desenvolver a tela de login"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Descrição (Opcional)</Text>
          <Input
            placeholder="Detalhes sobre o que precisa ser feito..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Text style={styles.label}>Prioridade</Text>
          <PrioritySelector selected={prioridade} onSelect={setPrioridade} />

          <Text style={styles.label}>Estimativa em horas (Opcional)</Text>
          <Input
            placeholder="Ex: 2.5"
            value={estimativa}
            onChangeText={setEstimativa}
            keyboardType="numeric"
          />

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Criando...' : 'Criar Tarefa'}
              onPress={handleCreateTask}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, flexGrow: 1 },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: { flex: 1, marginHorizontal: theme.spacing.xs },
  priorityText: { fontSize: 14 },
  priorityTextActive: { fontSize: 14, fontWeight: 'bold' },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
  },
});