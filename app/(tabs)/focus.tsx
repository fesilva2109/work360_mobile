import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import focusService from '../../src/services/focusService';
import analyticsService from '../../src/services/analyticsService';
import { FocusSession } from '../../src/types/focus.types';
import { theme } from '../../src/styles/theme';
import { Zap, Timer, BrainCircuit, HeartPulse, Ear, Check } from 'lucide-react-native';
import { router } from 'expo-router';

//Define os modos de visualização da tela: inicial, durante o foco, e o resumo final.

type ViewMode = 'initial' | 'active' | 'summary';

interface SummaryData {
  avgBpm: number;
  avgNoiseDb: number;
  duration: number;
  startTime: string;
  endTime?: string;
}

export default function FocusModeScreen() {
  const { usuario } = useAuth();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Guarda a referência do timer para poder iniciá-lo e pará-lo.
  const timerRef = useRef<number | null>(null);

  //Formata o tempo total em segundos para o formato "MM:SS".
  const formatTime = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return '00:00';
    }
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Limpa o intervalo do timer para evitar execuções em segundo plano.
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Inicia um timer que atualiza o tempo decorrido a cada segundo.
  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const [session, setSession] = useState<FocusSession | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  //Inicia uma nova sessão de foco, chamando o backend e mudando a tela para o modo ativo.

  const handleStartSession = async () => {
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    setIsLoading(true);
    try {
      const newSession = await focusService.startSession(usuario.id);
      setSession(newSession);
      setElapsedTime(0);
      setViewMode('active');
      startTimer();

      // Registra o evento de início de foco para as estatísticas.
      if (usuario) {
        analyticsService.createEvento({
          usuarioId: usuario.id,
          tipoEvento: 'FOCO_INICIO',
        });
      }
    } catch (error: any) {
      Alert.alert('Erro ao Iniciar', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //Para a sessão de foco atual, salva os dados e exibe a tela de resumo.

  const handleStopSession = async () => {
    if (!session) return;

    setIsLoading(true);
    clearTimer();

    try {
      const stoppedSession = await focusService.stopSession(session.id);
      setSummaryData({
        avgBpm: stoppedSession.avgBpm || 0,
        avgNoiseDb: stoppedSession.avgNoiseDb || 0,
        duration: elapsedTime,
        startTime: stoppedSession.startTime,
        endTime: stoppedSession.endTime,
      });
      // Registra o evento de fim de foco.
      if (usuario) {
        analyticsService.createEvento({
          usuarioId: usuario.id,
          tipoEvento: 'FOCO_FIM',
        });
      }
      setSession(null);
      setElapsedTime(0);
      setViewMode('summary');
    } catch (error: any) {
      Alert.alert('Erro ao Encerrar', error.message);
      startTimer();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSummary = () => {
    setSummaryData(null);
    setViewMode('initial');
  };

  //Renderiza o conteúdo da tela com base no modo de visualização atual.

  const renderContent = () => {
    switch (viewMode) {
      case 'active':
        return (
          <>
            <View style={styles.timerContainer}>
              <Timer size={48} color={theme.colors.text} />
              <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            </View>
            <View style={styles.sensorContainer}>
              <BrainCircuit size={24} color={theme.colors.textSecondary} />
              <Text style={styles.sensorText}>Mantenha a concentração. Estamos com você.</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStopSession}
              disabled={isLoading}
            >
              <View style={styles.buttonContent}>
                {isLoading
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.buttonText}>PARAR</Text>}
              </View>
            </TouchableOpacity>
          </>
        );
      case 'summary':
        return (
          <>
            <ScrollView contentContainerStyle={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Sessão Concluída!</Text>
              <View style={styles.summaryMetricsContainer}>
                <View style={styles.metricBox}>
                  <HeartPulse size={32} color={theme.colors.primary} />
                  <Text style={styles.metricValue}>{summaryData?.avgBpm.toFixed(0) ?? 'N/A'}</Text>
                  <Text style={styles.metricLabel}>BPM Médio</Text>
                </View>
                <View style={styles.metricBox}>
                  <Ear size={32} color={theme.colors.primary} />
                  <Text style={styles.metricValue}>{summaryData?.avgNoiseDb.toFixed(0) ?? 'N/A'} dB</Text>
                  <Text style={styles.metricLabel}>Ruído Médio</Text>
                </View>
              </View>
              <Text style={styles.summaryDuration}>Duração total: {formatTime(summaryData?.duration ?? 0)}</Text>
              <TouchableOpacity
                style={[styles.button, styles.startButton]}
                onPress={handleFinishSummary}
              >
                <View style={styles.buttonContent}>
                  <Check size={20} color="#FFF" />
                  <Text style={styles.buttonText}>CONCLUIR</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.push({
                  pathname: '/reports',
                  params: {
                    startTime: summaryData?.startTime,
                    endTime: summaryData?.endTime,
                  }
                })}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.secondaryButtonText}>Analisar Período de Foco</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </>
        );
      case 'initial':
      default:
        return (
          <>
            <Text style={styles.promptText}>Pronto para uma sessão de foco profundo?</Text>
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStartSession}
              disabled={isLoading}
            >
              <View style={styles.buttonContent}>
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>INICIAR</Text>}
              </View>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Zap size={32} color={theme.colors.primary} />
        <Text style={styles.title}>Modo Foco</Text>
        <Text style={styles.subtitle}>
          {viewMode === 'active'
            ? 'Sessão em andamento...'
            : 'Maximize sua produtividade'}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: 90,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.lg, 
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  promptText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  timerContainer: { alignItems: 'center', gap: theme.spacing.sm },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  sensorContainer: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  sensorText: { fontSize: 16, color: theme.colors.textSecondary, fontStyle: 'italic' },
  button: {
    width: '80%',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
    marginTop: theme.spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingLeft: 20,
    paddingRight: 20,

  },
  startButton: { backgroundColor: theme.colors.primary },
  stopButton: { backgroundColor: theme.colors.primary }, 
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  summaryContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  summaryMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: theme.spacing.xl,
  },
  metricBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '45%',
    ...theme.shadows.small,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryDuration: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
});