import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { RelatorioGerado } from '../src/types/report.types';
import { theme } from '../src/styles/theme';
import { BrainCircuit, TrendingUp, ShieldCheck, Lightbulb, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Componente para a barra de Risco de Burnout
const RiskBar = ({ value }: { value: number | null | undefined }) => {
  const riskValue = value || 0;
  const getColor = () => {
    if (riskValue > 0.7) return theme.colors.error;
    if (riskValue > 0.4) return theme.colors.warning;
    return theme.colors.success;
  };
  return (
    <View>
      <View style={styles.riskBarContainer}>
        <View style={[styles.riskBar, { width: `${riskValue * 100}%`, backgroundColor: getColor() }]} />
      </View>
      <Text style={[styles.riskLabel, { color: getColor() }]}>{(riskValue * 100).toFixed(0)}% de Risco</Text>
    </View>
  );
};

export default function InsightScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const report: RelatorioGerado | null = params.report ? JSON.parse(params.report as string) : null;

  if (!report || !report.insights) {
    return ( // Tela de fallback caso não haja dados
      <View style={styles.container}>
        <Text>Nenhuma análise de IA encontrada para este relatório.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{ headerShown: false }} // Remove o cabeçalho padrão
      />
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#E3F2FD', theme.colors.background]}
          style={styles.headerGradient}
        >
          <BrainCircuit size={48} color={theme.colors.primary} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Sua Análise de Produtividade</Text>
          <Text style={styles.mainSubtitle}>Insights gerados por IA com base no seu último relatório.</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ShieldCheck size={24} color={theme.colors.warning} />
              <Text style={styles.cardTitle}>Risco de Burnout</Text>
            </View>
            <RiskBar value={report.riscoBurnout} />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp size={24} color={theme.colors.success} />
              <Text style={styles.cardTitle}>Resumo Geral</Text>
            </View>
            <Text style={styles.cardText}>{report.resumoGeral || 'Nenhum resumo disponível.'}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Lightbulb size={24} color={theme.colors.info} />
              <Text style={styles.cardTitle}>Recomendações</Text>
            </View>
            <Text style={styles.cardText}>{report.recomendacaoIA || 'Nenhuma recomendação disponível.'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl, // Aumenta o espaçamento no topo
    alignItems: 'center',
    position: 'relative', // Necessário para o posicionamento absoluto do botão
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.lg,
    padding: theme.spacing.xs,
    zIndex: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  mainSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
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
  riskLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
});