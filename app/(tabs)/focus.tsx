import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import focusService from '../../src/services/focusService';
import { FocusSession } from '../../src/types/focus.types';
import { theme } from '../../src/styles/theme';
import { Zap, Timer, Mic } from 'lucide-react-native';

export default function FocusModeScreen() {
  const { usuario } = useAuth();
  const [session, setSession] = useState<FocusSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para formatar o tempo em MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Limpa o timer para evitar memory leaks
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Inicia o timer local
  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    // Garante que o timer seja limpo quando o componente for desmontado
    return () => clearTimer();
  }, []);

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
      startTimer();
    } catch (error: any) {
      Alert.alert('Erro ao Iniciar', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSession = async () => {
    if (!session) return;

    setIsLoading(true);
    clearTimer(); // Para o timer imediatamente

    try {
      const stoppedSession = await focusService.stopSession(session.id);
      Alert.alert(
        'Sessão Encerrada!',
        `BPM Médio: ${stoppedSession.avgBpm || 'N/A'} | Ruído: ${stoppedSession.avgNoiseDb?.toFixed(0) || 'N/A'} dB`
      );
      setSession(null); // Reseta o estado para a tela inicial
      setElapsedTime(0);
    } catch (error: any) {
      Alert.alert('Erro ao Encerrar', error.message);
      // Se der erro, reinicia o timer para o usuário não perder o tempo
      startTimer();
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = session?.status === 'EM_ANDAMENTO';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Zap size={32} color={theme.colors.primary} />
        <Text style={styles.title}>Modo Foco</Text>
      </View>

      {isActive ? (
        // --- TELA DE FOCO ATIVO ---
        <View style={styles.content}>
          <View style={styles.timerContainer}>
            <Timer size={48} color={theme.colors.text} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
          <View style={styles.sensorContainer}>
            <Mic size={24} color={theme.colors.textSecondary} />
            <Text style={styles.sensorText}>📡 Monitorando sensores...</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStopSession}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>PARAR</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        // --- TELA INICIAL ---
        <View style={styles.content}>
          <Text style={styles.promptText}>Pronto para uma sessão de foco profundo?</Text>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStartSession}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>INICIAR</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
  timerText: { fontSize: 72, fontWeight: 'bold', color: theme.colors.text, fontFamily: 'monospace' },
  sensorContainer: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  sensorText: { fontSize: 16, color: theme.colors.textSecondary, fontStyle: 'italic' },
  button: {
    width: '80%',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  startButton: { backgroundColor: theme.colors.success },
  stopButton: { backgroundColor: theme.colors.danger },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
});