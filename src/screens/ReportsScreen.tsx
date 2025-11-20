import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, FileText } from 'lucide-react-native';

import { useAuth } from '../contexts/AuthContext';
import reportService from '../services/reportService';
import { RelatorioGerado } from '../types/report.types';
import { theme } from '../styles/theme';

type ReportStackNavigatorParams = {
  ReportList: undefined;
  ReportDetail: { report: RelatorioGerado };
};

type ReportListNavigationProp = NativeStackNavigationProp<ReportStackNavigatorParams, 'ReportList'>;

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export function ReportsScreen() {
  const { usuario } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<RelatorioGerado[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'inicio' | 'fim' | null>(null);

  const fetchReports = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const data = await reportService.getUserReports(usuario.id);
      setReports(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os relatórios.");
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const handleGenerateReport = async () => {
    if (!usuario) return;
    setGenerating(true);
    try {
      await reportService.gerarRelatorioBase({
        usuarioId: usuario.id,
        dataInicio: formatDate(dataInicio),
        dataFim: formatDate(dataFim),
      });
      Alert.alert("Sucesso!", "Relatório base gerado. Toque nele na lista abaixo para ver os detalhes e solicitar a análise da IA.");
      fetchReports();
    } catch (error: any) {
      // Extrai a mensagem de erro específica vinda do backend.
      // Se não houver, usa uma mensagem padrão.
      let errorMessage = error.response?.data?.message || "Não foi possível gerar o relatório.";

      // Personaliza a mensagem para o erro 400 (Bad Request)
      if (error.response?.status === 400) {
        errorMessage = "Não há dados de produtividade suficientes no período selecionado para gerar um relatório. Tente um intervalo de datas diferente.";
      }

      Alert.alert("Erro ao Gerar", errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || (showPicker === 'inicio' ? dataInicio : dataFim);
    setShowPicker(null);
    if (showPicker === 'inicio') {
      setDataInicio(currentDate);
    } else {
      setDataFim(currentDate);
    }
  };

  const renderItem = ({ item }: { item: RelatorioGerado }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        router.push({
          pathname: `/report/${item.id}`,
          params: { report: JSON.stringify(item) },
        })
      }
    >
      <Text style={styles.itemTitle}>Relatório de {formatDate(new Date(item.dataInicio))} a {formatDate(new Date(item.dataFim))}</Text>
      <Text style={styles.itemDate}>Gerado em: {new Date(item.criadoEm).toLocaleString('pt-BR')}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
        </View>

        <View style={styles.generatorSection}>
          <Text style={styles.sectionTitle}>Gerar Novo Relatório</Text>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker('inicio')}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={styles.datePickerText}>Início: {formatDate(dataInicio)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker('fim')}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={styles.datePickerText}>Fim: {formatDate(dataFim)}</Text>
            </TouchableOpacity>
          </View>
          {showPicker && (
            <DateTimePicker
              value={showPicker === 'inicio' ? dataInicio : dataFim}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={handleGenerateReport}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.generateButtonText}>Gerar Relatório</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Relatórios Salvos</Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <FlatList
              data={reports}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>Nenhum relatório salvo.</Text>}
              scrollEnabled={false} // Desativa o scroll da FlatList para usar o da ScrollView principal
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl, // Espaço extra no final
  },
  header: { paddingBottom: theme.spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  generatorSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
    padding: theme.spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: theme.spacing.md, color: theme.colors.text },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '48%',
  },
  datePickerText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listSection: {},
  itemContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  itemContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  itemDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: theme.colors.textSecondary, fontSize: 16 },
});