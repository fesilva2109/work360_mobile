import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useAuth } from '../contexts/AuthContext';
import reportService from '../services/reportService';
import { RelatorioGerado } from '../types/report.types';

type ReportStackNavigatorParams = {
  ReportList: undefined;
  ReportDetail: { report: RelatorioGerado };
};

type ReportListNavigationProp = NativeStackNavigationProp<ReportStackNavigatorParams, 'ReportList'>;

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export function ReportsScreen() {
  const { usuario } = useAuth();
  const navigation = useNavigation<ReportListNavigationProp>();

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

  useFocusEffect(fetchReports);

  const handleGenerateReport = async () => {
    if (!usuario) return;
    setGenerating(true);
    try {
      await reportService.generateReport({
        usuarioId: usuario.id,
        dataInicio: formatDate(dataInicio),
        dataFim: formatDate(dataFim),
      });
      Alert.alert("Sucesso", "Relatório gerado! Atualizando lista...");
      fetchReports();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o relatório.");
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
    <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('ReportDetail', { report: item })}>
      <Text style={styles.itemTitle}>Relatório de {formatDate(new Date(item.dataInicio))} a {formatDate(new Date(item.dataFim))}</Text>
      <Text style={styles.itemDate}>Gerado em: {new Date(item.criadoEm).toLocaleString('pt-BR')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.generatorSection}>
        <Text style={styles.sectionTitle}>Gerar Novo Relatório</Text>
        <View style={styles.dateContainer}>
          <Button onPress={() => setShowPicker('inicio')} title={`Início: ${formatDate(dataInicio)}`} />
          <Button onPress={() => setShowPicker('fim')} title={`Fim: ${formatDate(dataFim)}`} />
        </View>
        {showPicker && (
          <DateTimePicker
            value={showPicker === 'inicio' ? dataInicio : dataFim}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        <Button
          title={generating ? "Gerando..." : "Gerar Relatório"}
          onPress={handleGenerateReport}
          disabled={generating}
        />
      </View>

      <Text style={styles.sectionTitle}>Relatórios Salvos</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum relatório salvo.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7', padding: 16 },
  generatorSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemDate: { fontSize: 12, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
});