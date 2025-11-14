import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { theme } from '../styles/theme';
import taskService from '../services/taskService';
import meetingService from '../services/meetingService';
import analyticsService from '../services/analyticsService';
import { CheckCircle, Calendar, TrendingUp, Clock } from 'lucide-react-native';

export function DashboardScreen() {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    tarefasPendentes: 0,
    tarefasConcluidas: 0,
    proximasReunioes: 0,
    minutosFoco: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      const [tarefas, reunioes, metricasHoje] = await Promise.all([
        taskService.getTasks(usuario.id),
        meetingService.getUpcomingMeetings(usuario.id),
        analyticsService.getTodayMetrics(usuario.id),
      ]);

      const pendentes = tarefas.filter(t => t.status !== 'CONCLUIDA').length;
      const concluidas = tarefas.filter(t => t.status === 'CONCLUIDA').length;

      setStats({
        tarefasPendentes: pendentes,
        tarefasConcluidas: concluidas,
        proximasReunioes: reunioes.length,
        minutosFoco: metricasHoje?.minutos_foco || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {usuario?.nome}!</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard} variant="elevated">
          <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>{stats.tarefasPendentes}</Text>
          <Text style={styles.statLabel}>Tarefas Pendentes</Text>
        </Card>

        <Card style={styles.statCard} variant="elevated">
          <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
            <CheckCircle size={24} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{stats.tarefasConcluidas}</Text>
          <Text style={styles.statLabel}>Concluídas Hoje</Text>
        </Card>

        <Card style={styles.statCard} variant="elevated">
          <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Calendar size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{stats.proximasReunioes}</Text>
          <Text style={styles.statLabel}>Próximas Reuniões</Text>
        </Card>

        <Card style={styles.statCard} variant="elevated">
          <View style={[styles.iconContainer, { backgroundColor: '#E0E7FF' }]}>
            <TrendingUp size={24} color="#6366F1" />
          </View>
          <Text style={styles.statValue}>{stats.minutosFoco}</Text>
          <Text style={styles.statLabel}>Minutos de Foco</Text>
        </Card>
      </View>

      <Card style={styles.welcomeCard} variant="elevated">
        <Text style={styles.welcomeTitle}>Bem-vindo ao Work360</Text>
        <Text style={styles.welcomeText}>
          Gerencie suas tarefas, reuniões e produtividade em um só lugar.
          Comece explorando as funcionalidades usando a navegação abaixo.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  welcomeCard: {
    padding: theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
