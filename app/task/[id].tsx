import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Tarefa } from '../../src/types/models';
import taskService from '../../src/services/taskService';
import { theme } from '../../src/styles/theme';
import { Button } from '../../src/components/Button';
import { Tag, AlignLeft, Clock } from 'lucide-react-native';

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) {
  if (!value) return null;

  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        {icon}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadTaskDetails(id);
    }
  }, [id]);

  const loadTaskDetails = async (taskId: string) => {
    setLoading(true);
    try {
      const data = await taskService.getTaskById(Number(taskId));
      setTarefa(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da tarefa.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!tarefa) return;

    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await taskService.deleteTask(tarefa.id);
              Alert.alert("Sucesso", "Tarefa excluída.");
              router.replace('/(tabs)/tasks');
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a tarefa.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centered} />;
  }

  if (!tarefa) {
    return (
      <View style={styles.centered}>
        <Text>Tarefa não encontrada.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalhes da Tarefa', headerBackTitle: 'Voltar' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{tarefa.titulo}</Text>

        <View style={styles.detailsContainer}>
          <DetailRow
            icon={<Tag size={20} color={theme.colors.textSecondary} />}
            label="Prioridade"
            value={tarefa.prioridade || 'Não definida'}
          />
          <DetailRow
            icon={<Clock size={20} color={theme.colors.textSecondary} />}
            label="Estimativa"
            value={
              tarefa.estimativaMinutos
                ? `${tarefa.estimativaMinutos} minutos`
                : 'Não definida'
            }
          />
          <DetailRow
            icon={<AlignLeft size={20} color={theme.colors.textSecondary} />}
            label="Descrição"
            value={tarefa.descricao}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Editar Tarefa"
            onPress={() => router.push(`/task/edit/${tarefa.id}`)}
            variant="primary"
          />
          <Button
            title="Excluir Tarefa"
            onPress={handleDelete}
            variant="danger"
            style={{ marginTop: theme.spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, flexGrow: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  detailsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  detailRow: { marginBottom: theme.spacing.lg },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm + 20, 
    lineHeight: 22,
  },
  actions: { marginTop: 'auto', paddingTop: theme.spacing.lg },
});