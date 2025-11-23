import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import { BrainCircuit, BarChart, Clock, CheckCircle, Trophy, FilePlus, Sparkles, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import reportService from '../../src/services/reportService';
import { RelatorioGerado } from '../../src/types/report.types';
import { theme } from '../../src/styles/theme';

// card para exibir uma métrica de conquista.
const AchievementCard = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <View style={styles.achievementCard}>
    {icon}
    <Text style={styles.achievementValue}>{value}</Text>
    <Text style={styles.achievementLabel}>{label}</Text>
  </View>
);

export default function AnalyticsScreen() {
  const { usuario } = useAuth();
  //Guarda o relatório mais recente, usado para exibir as métricas de Suas Conquistas.
  const [latestReportForMetrics, setLatestReportForMetrics] = useState<RelatorioGerado | null>(null);
  // Guarda o relatório mais recente que já foi analisado pela IA. 
  const [latestReportForInsight, setLatestReportForInsight] = useState<RelatorioGerado | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Busca os relatórios do usuário no backend e os separa em dois estados:
  // O mais recente de todos - para as métricas.
  // O mais recente que já tem insights da IA.

  const fetchLatestReport = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const reports = await reportService.getUserReports(usuario.id);
      reports.sort((a, b) => b.id - a.id);

      const latestReport = reports.length > 0 ? reports[0] : null;
      setLatestReportForMetrics(latestReport);

      const latestWithInsights = reports.find(r => r.insights);
      setLatestReportForInsight(latestWithInsights || null);

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar seu último relatório.');
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  // Recarrega os dados.
  useFocusEffect(
    useCallback(() => {
      fetchLatestReport();
    }, [fetchLatestReport])
  );
  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <BarChart size={32} color={theme.colors.primary} />
          <Text style={styles.title}>Sua Produtividade</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/reports')}>
            <FilePlus size={36} color={theme.colors.primary} />
            <Text style={styles.actionCardTitle}>Gerar Novo Relatório</Text>
            <Text style={styles.actionCardSubtitle}>Analise um novo período.</Text>
          </TouchableOpacity>
          {latestReportForInsight && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push({
                pathname: '/insight',
                params: { report: JSON.stringify(latestReportForInsight) }
              })}>
              <Sparkles size={36} color={theme.colors.warning} />
              <Text style={styles.actionCardTitle}>Ver Último Insight</Text>
              <Text style={styles.actionCardSubtitle}>
                Análise de {new Date(latestReportForInsight.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })}.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mostra um card de notificação se o último relatório gerado ainda não foi analisado pela IA */}
        {latestReportForMetrics && !latestReportForMetrics.insights && (
          <View style={styles.notificationCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>Novo relatório pronto para análise!</Text>
              <Text style={styles.notificationText}>Gere novos insights com base em seus dados mais recentes.</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push({
                pathname: '/report/[id]',
                params: { report: JSON.stringify(latestReportForMetrics) }
              })}
            >
              <Text style={styles.notificationButtonText}>Analisar</Text>
            </TouchableOpacity>
          </View>
        )}

        {latestReportForMetrics ? (
          <>
            <View style={styles.achievementsHeader}>
              <Trophy size={24} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Suas Conquistas</Text>
              <Text style={styles.sectionSubtitle}>
                Período: {new Date(latestReportForMetrics.dataInicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a{' '}
                {new Date(latestReportForMetrics.dataFim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </Text>
            </View>

            <View style={styles.achievementsGrid}>
              <AchievementCard icon={<CheckCircle size={32} color={theme.colors.success} />} value={latestReportForMetrics.tarefasConcluidas} label="Tarefas Concluídas" />
              <AchievementCard icon={<Clock size={32} color={theme.colors.primary} />} value={latestReportForMetrics.minutosFocoTotal} label="Minutos de Foco" />
              <AchievementCard icon={<Calendar size={32} color={theme.colors.info} />} value={latestReportForMetrics.reunioesRealizadas} label="Reuniões" />
            </View>
        </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <LinearGradient
              colors={['#E3F2FD', theme.colors.surface]}
              style={[styles.card, styles.placeholderCard]}
            >
              <Text style={styles.placeholderText}>Nenhum relatório encontrado.</Text>
              <Text style={styles.placeholderSubtext}>Gere seu primeiro relatório para visualizar seus insights de produtividade.</Text>
              <TouchableOpacity style={styles.iaButton} onPress={() => router.push('/reports')}>
                <Text style={styles.iaButtonText}>Gerar Relatório</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.md : 0,
    marginTop: Platform.OS === 'android' ? theme.spacing.md : 0,

  },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center', 
    ...theme.shadows.medium,
    gap: theme.spacing.lg, 
  },
  actionCardTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center', 
  },
  actionCardSubtitle: {
    fontSize: 14, 
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.infoDark,
  },
  notificationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  notificationButton: {
    backgroundColor: theme.colors.info,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.md,
  },
  notificationButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  achievementsHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginTop: theme.spacing.xs },
  sectionSubtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
  },
  achievementCard: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    width: '30%',
    ...theme.shadows.medium,
  },
  achievementValue: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, marginVertical: 8 },
  achievementLabel: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, ...theme.shadows.medium },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
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
  iaCard: { backgroundColor: '#E3F2FD' },
  iaCardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
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
