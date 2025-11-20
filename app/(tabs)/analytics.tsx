import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import { BrainCircuit, BarChart, Clock, CheckCircle, History } from 'lucide-react-native';

import { useAuth } from '../../src/contexts/AuthContext';
import reportService from '../../src/services/reportService';
import { RelatorioGerado } from '../../src/types/report.types';
import { theme } from '../../src/styles/theme';

// Componente para os cards de métricas
const MetricCard = ({ icon, title, value, unit }: { icon: React.ReactNode; title: string; value: string | number; unit: string }) => (
  <View style={styles.metricCard}>
    {icon}
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricUnit}>{unit}</Text>
  </View>
);

// Componente para a barra de Risco de Burnout
const RiskBar = ({ value }: { value: number | null | undefined }) => {
  const riskValue = value || 0;
  const getColor = () => {
    if (riskValue > 0.7) return theme.colors.error;
    if (riskValue > 0.4) return theme.colors.warning;
    return theme.colors.success;
  };
  return (
    <View style={styles.riskBarContainer}>
      <View style={[styles.riskBar, { width: `${riskValue * 100}%`, backgroundColor: getColor() }]} />
    </View>
  );
};

export default function AnalyticsScreen() {
  const { usuario } = useAuth();
  const [report, setReport] = useState<RelatorioGerado | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLatestReport = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const reports = await reportService.getUserReports(usuario.id);
      // Pega o relatório mais recente (o backend já deve retornar ordenado)
      setReport(reports.length > 0 ? reports[0] : null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar seu último relatório.');
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      fetchLatestReport();
    }, [fetchLatestReport])
  );
  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Produtividade',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/reports')}>
              <History color={theme.colors.primary} size={26} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <BarChart size={32} color={theme.colors.primary} />
        <Text style={styles.title}>Seu Último Insight</Text>
      </View>

      {report && (
        <>
          <View style={styles.metricsGrid}>
            <MetricCard icon={<Clock size={32} color={theme.colors.primary} />} title="Minutos de Foco" value={report.minutosFocoTotal} unit="min" />
            <MetricCard icon={<CheckCircle size={32} color={theme.colors.success} />} title="Tarefas Concluídas" value={report.tarefasConcluidas} unit="tarefas" />
          </View>

          {report.insights ? (
            <View style={[styles.card, styles.iaCard]}>
              <View style={styles.cardHeader}>
                <BrainCircuit size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Análise de Produtividade</Text>
              </View>
              <View style={styles.iaContent}>
                <Text style={styles.iaSectionTitle}>Risco de Burnout</Text>
                <RiskBar value={report.riscoBurnout} />

                <Text style={styles.iaSectionTitle}>Resumo Geral</Text>
                <Text style={styles.iaText}>{report.resumoGeral || 'Nenhum resumo disponível.'}</Text>

                <Text style={styles.iaSectionTitle}>Insights</Text>
                <Text style={styles.iaText}>{report.insights || 'Nenhum insight disponível.'}</Text>

                <Text style={styles.iaSectionTitle}>Recomendações</Text>
                <Text style={styles.iaText}>{report.recomendacaoIA || 'Nenhuma recomendação disponível.'}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.card, styles.placeholderCard]} />
          )}
        </>
      )}

      {!loading && !report && (
        <View style={styles.emptyStateContainer}>
          <View style={[styles.card, styles.placeholderCard]}>
            <Text style={styles.placeholderText}>Nenhum relatório encontrado.</Text>
            <Text style={styles.placeholderSubtext}>Gere seu primeiro relatório para visualizar seus insights de produtividade.</Text>
            <TouchableOpacity style={styles.iaButton} onPress={() => router.push('/reports')}>
              <Text style={styles.iaButtonText}>Gerar Relatório</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg },
  metricCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  metricValue: { fontSize: 36, fontWeight: 'bold', color: theme.colors.primary, marginVertical: theme.spacing.sm },
  metricTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  metricUnit: { fontSize: 12, color: theme.colors.textSecondary },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, ...theme.shadows.medium },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  placeholderCard: { alignItems: 'center', backgroundColor: theme.colors.surface, paddingVertical: theme.spacing.xl },
  placeholderText: { fontSize: 18, fontWeight: '600', color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.sm },
  placeholderSubtext: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl, maxWidth: '80%' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  iaButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
  },
  iaButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  iaCard: { backgroundColor: '#E3F2FD' }, // Fundo azul claro para destaque
  iaContent: { gap: theme.spacing.md },
  iaSectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: theme.spacing.sm },
  iaText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  riskBarContainer: {
    height: 10,
    width: '100%',
    backgroundColor: theme.colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  riskBar: {
    height: '100%',
    borderRadius: 5,
  },
});
