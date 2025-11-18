import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocus } from '../src/contexts/FocusContext';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { theme } from '../src/styles/theme';
import { Activity, Zap, Pause, Play, StopCircle } from 'lucide-react-native';

export default function FocusScreen() {
  const router = useRouter();
  const {
    isActive,
    isPaused,
    time,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    iotData,
  } = useFocus();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStop = () => {
    Alert.alert(
      "Encerrar Sessão",
      "Tem certeza que deseja encerrar a sessão de foco?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Encerrar",
          onPress: () => {
            stopFocus();
            router.back();
          },
          style: "destructive",
        },
      ]
    );
  };

  if (!isActive) {
    return (
      <View style={styles.container}>
        <Card>
          <View style={styles.startContainer}>
            <Zap size={48} color={theme.colors.primary} />
            <Text style={styles.startTitle}>Pronto para Focar?</Text>
            <Text style={styles.startSubtitle}>
              Inicie uma nova sessão de foco para monitorar sua produtividade e bem-estar.
            </Text>
            <Button title="Iniciar Sessão de Foco" onPress={startFocus} />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
        <Text style={styles.timerSubtitle}>Tempo de Foco</Text>
      </View>

      <Card>
        <View style={styles.iotContainer}>
          <Text style={styles.iotTitle}>Dados Biométricos</Text>
          <View style={styles.iotRow}>
            <Activity size={24} color={theme.colors.primary} />
            <Text style={styles.iotText}>
              Batimentos: {iotData.heartRate} bpm
            </Text>
          </View>
          <View style={styles.iotRow}>
            <Zap size={24} color={theme.colors.secondary} />
            <Text style={styles.iotText}>
              Ruído Ambiente: {iotData.noiseLevel.toFixed(2)} dB
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.controlsContainer}>
        {isPaused ? (
          <TouchableOpacity style={styles.controlButton} onPress={resumeFocus}>
            <Play size={48} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.controlButton} onPress={pauseFocus}>
            <Pause size={48} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
          <StopCircle size={48} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
  },
  startContainer: {
    alignItems: 'center',
    padding: 20,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 15,
  },
  startSubtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  timerSubtitle: {
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 10,
  },
  iotContainer: {
    padding: 15,
  },
  iotTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  iotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iotText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
  },
  controlButton: {
    padding: 15,
  },
});
