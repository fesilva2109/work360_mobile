import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useNavigation, Stack, useRouter } from 'expo-router'; // Mantém useRouter
import reportService from '../../src/services/reportService';
import { RelatorioGerado } from '../../src/types/report.types';
import { theme } from '../../src/styles/theme';
import { CheckCircle, Clock, Calendar, BrainCircuit, Trophy, Sparkles, Trash2 } from 'lucide-react-native';

//Barra de progresso usada enquanto a IA está analisando o relatório.

const IndeterminateProgressBar = () => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return <View style={styles.progressBarContainer}><Animated.View style={[styles.progressBar, { width }]} /></View>;
};

//Um card para exibir uma métrica de conquista.
const AchievementCard = ({ icon, value, label, style }: { icon: React.ReactNode; value: string | number; label: string; style?: object }) => (
  <View style={[styles.achievementCard, style]}>
    {icon}
    <Text style={styles.achievementValue}>{value}</Text>
    <Text style={styles.achievementLabel}>{label}</Text>
  </View>
);

export default function ReportDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [report, setReport] = useState<RelatorioGerado | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
 
  const params = useLocalSearchParams();

  useEffect(() => {
     // Carrega os dados do relatório passados pela tela anterior.
     if (params.report && typeof params.report === 'string') {
       setReport(JSON.parse(params.report));
     }
     setLoading(false);
   }, [params.report]);

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

  //Envia o relatório para análise da IA e atualiza a tela com os novos dados.

  const handleEnrichReport = async () => {
     if (!report) return;
     setIsGeneratingAI(true);

     try {
       const enrichedReport = await reportService.enriquecerRelatorioComIA(report.id);
       setReport(enrichedReport);
 
       Alert.alert(
         "Análise Concluída!",
         "Seus insights de produtividade estão prontos. Vamos visualizá-los agora.",
         [{ text: "OK", onPress: () => router.replace('/(tabs)/analytics') }]
       );
     } catch (error) {
       Alert.alert("Erro", "Não foi possível gerar a análise de IA no momento.");
     } finally {
       setIsGeneratingAI(false);
     }
   };

  if (loading || !report) {
    return <View style={styles.container}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Detalhes do Relatório',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: theme.spacing.md }}>
              <Trash2 size={24} color={theme.colors.error} />
            </TouchableOpacity>
          ),
          headerBackTitle: 'Voltar',
          headerTintColor: theme.colors.primary,
        }}
      />

      <View style={styles.headerContainer}>
        <Trophy size={32} color={theme.colors.warning} />
        <Text style={styles.header}>Suas Conquistas</Text>
        <Text style={styles.subHeader}>
          Período: {new Date(report.dataInicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a{' '}
          {new Date(report.dataFim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </Text>
      </View>

      <View style={styles.achievementsGrid}>
        <AchievementCard icon={<CheckCircle size={32} color={theme.colors.success} />} value={report.tarefasConcluidas} label="Tarefas Concluídas" />
        <AchievementCard icon={<Clock size={32} color={theme.colors.primary} />} value={report.minutosFocoTotal} label="Minutos de Foco" />
        <AchievementCard icon={<Calendar size={32} color={theme.colors.info} />} value={report.reunioesRealizadas} label="Reuniões" />
      </View>

      {/*Se o relatório já tem insights, mostra um aviso, se não, mostra o botão para gerar a análise com a IA.*/}
      {report.insights ? (
        <View style={styles.iaResultCard}>
          <View style={styles.cardHeader}>
            <Sparkles size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Análise de IA Concluída</Text>
          </View>
          <Text style={styles.cardContent}>Você pode visualizar a análise completa na aba "Produtividade".</Text>
        </View>
      ) : (
        <View style={styles.iaPromptCard}>
          <BrainCircuit size={48} color={theme.colors.primary} />
          <Text style={styles.iaPromptTitle}>Desbloqueie seus Insights</Text>
          <Text style={styles.iaPromptText}>Analise suas conquistas com nossa IA para receber um resumo, insights e recomendações personalizadas.</Text>
          <TouchableOpacity style={styles.iaButton} onPress={handleEnrichReport} disabled={isGeneratingAI}>
            {isGeneratingAI ? (
              <IndeterminateProgressBar />
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
  cardContent: { fontSize: 14, lineHeight: 20, color: theme.colors.textSecondary },
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
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
  },
});