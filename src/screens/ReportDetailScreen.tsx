import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import reportService from '../services/reportService';
import { RelatorioGerado } from '../types/report.types';

type ReportStackNavigatorParams = {
  ReportDetail: { report: RelatorioGerado };
};

type ReportDetailRouteProp = RouteProp<ReportStackNavigatorParams, 'ReportDetail'>;

// Componente simples para barra de progresso
const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <View style={styles.progressOuter}>
    <View style={[styles.progressInner, { width: `${value * 100}%`, backgroundColor: color }]} />
  </View>
);

export function ReportDetailScreen() {
  const route = useRoute<ReportDetailRouteProp>();
  const navigation = useNavigation();
  const { report } = route.params;

  const handleDelete = () => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este relatório?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            await reportService.deleteReport(report.id);
            Alert.alert("Sucesso", "Relatório excluído.");
            navigation.goBack();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o relatório.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const getBurnoutColor = (risk: number) => {
    if (risk > 0.7) return '#d32f2f'; // Alto
    if (risk > 0.4) return '#fbc02d'; // Médio
    return '#388e3c'; // Baixo
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Detalhes do Relatório</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo Geral</Text>
        <Text style={styles.cardContent}>{report.resumoGeral}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Insights de Produtividade</Text>
        <Text style={styles.cardContent}>{report.insights}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recomendação da IA</Text>
        <Text style={styles.cardContent}>{report.recomendacaoIA}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Métricas Principais</Text>
        <Text style={styles.metric}>Tarefas Concluídas: {report.tarefasConcluidas}</Text>
        <Text style={styles.metric}>Minutos de Foco Total: {report.minutosFocoTotal}</Text>
        <Text style={styles.metric}>Risco de Burnout:</Text>
        <ProgressBar value={report.riscoBurnout} color={getBurnoutColor(report.riscoBurnout)} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Excluir Relatório" color="red" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  metric: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressOuter: {
    height: 20,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  progressInner: {
    height: '100%',
    borderRadius: 10,
  },
  buttonContainer: {
    margin: 16,
  },
});