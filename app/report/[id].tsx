import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import reportService from '../../src/services/reportService';
import { RelatorioGerado } from '../../src/types/report.types';
import { theme } from '../../src/styles/theme';
import { CheckCircle, Clock, Calendar, BrainCircuit, Trophy, Sparkles } from 'lucide-react-native';

// Componente simples para barra de progresso
// Componente para os "Achievements"
const AchievementCard = ({ icon, value, label, style }: { icon: React.ReactNode; value: string | number; label: string; style?: object }) => (
  <View style={[styles.achievementCard, style]}>
    {icon}
    <Text style={styles.achievementValue}>{value}</Text>
    <Text style={styles.achievementLabel}>{label}</Text>
  </View>
);

export default function ReportDetailScreen() {
  const navigation = useNavigation();
  const [report, setReport] = useState<RelatorioGerado | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);


 
  // Como o backend não tem um getReportById, vamos receber o objeto via params.
  // O expo-router permite isso.
  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.report) {
      setReport(JSON.parse(params.report as string));
    }
    setLoading(false);
  }, [params.report]);

  const handleEnrichReport = async () => {
    if (!report) return;
    setIsGeneratingAI(true);
    try {
      // Chama o serviço para enriquecer o relatório com a IA
      const enrichedReport = await reportService.enriquecerRelatorioComIA(report.id);
      setReport(enrichedReport); // Atualiza o estado local com os novos dados

      Alert.alert(
        "Análise Concluída!",
        "Seus insights de produtividade estão prontos. Vamos visualizá-los agora.",
        [{ text: "OK", onPress: () => {
          navigation.navigate('(tabs)', { screen: 'analytics' });
        }}]      
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar a análise de IA no momento.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDelete = () => {
    if (!report) return;
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

  if (loading || !report) {
    return <View style={styles.container}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Trophy size={32} color={theme.colors.warning} />
        <Text style={styles.header}>Suas Conquistas</Text>
        <Text style={styles.subHeader}>
          Período: {new Date(report.dataInicio).toLocaleDateString('pt-BR')} a {new Date(report.dataFim).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.achievementsGrid}>
        <AchievementCard icon={<CheckCircle size={32} color={theme.colors.success} />} value={report.tarefasConcluidas} label="Tarefas Concluídas" />
        <AchievementCard icon={<Clock size={32} color={theme.colors.primary} />} value={report.minutosFocoTotal} label="Minutos de Foco" />
        <AchievementCard icon={<Calendar size={32} color={theme.colors.info} />} value={report.reunioesRealizadas} label="Reuniões" />
      </View>
      {/* Seção Condicional da IA */}
      {report.insights ? (
        // Se já tem análise, mostra os resultados
        <View style={styles.iaResultCard}>
          <View style={styles.cardHeader}>
            <Sparkles size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Análise de IA Concluída</Text>
          </View>
          <Text style={styles.cardContent}>Você já analisou este relatório. Para uma nova análise, gere um relatório para um período diferente.</Text>
        </View>
      ) : (
        // Se não tem análise, mostra o botão para gerar
        <View style={styles.iaPromptCard}>
          <BrainCircuit size={48} color={theme.colors.primary} />
          <Text style={styles.iaPromptTitle}>Desbloqueie seus Insights</Text>
          <Text style={styles.iaPromptText}>Analise suas conquistas com nossa IA para receber um resumo, insights e recomendações personalizadas.</Text>
          <TouchableOpacity style={styles.iaButton} onPress={handleEnrichReport} disabled={isGeneratingAI}>
            {isGeneratingAI ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Sparkles size={18} color="#FFF" />
                <Text style={styles.iaButtonText}>Analisar com IA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerContainer: { alignItems: 'center', padding: 24 },
    header: { fontSize: 28, fontWeight: '700', color: theme.colors.text, marginTop: 8 },
    subHeader: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
    achievementsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 24 },
    achievementCard: {
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      width: '30%',
      ...theme.shadows.medium,
    },
    achievementValue: { fontSize: 36, fontWeight: 'bold', color: theme.colors.primary, marginVertical: 8 },
    achievementLabel: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', fontWeight: '500' },
    card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...theme.shadows.medium,
  },
  iaResultCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  cardContent: { fontSize: 14, lineHeight: 20, color: theme.colors.textSecondary, marginBottom: 16 },
  iaSectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: 8, marginBottom: 4 },
  iaPromptCard: { alignItems: 'center', padding: 24, marginHorizontal: 16, backgroundColor: '#E3F2FD', borderRadius: theme.borderRadius.xl },
  iaPromptTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primaryDark, marginTop: 16, marginBottom: 8 },
  iaPromptText: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  iaButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: theme.borderRadius.full, alignItems: 'center', gap: 8, ...theme.shadows.large
  },
  iaButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});