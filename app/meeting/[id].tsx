import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import meetingService from '../../src/services/meetingService';
import { Reuniao } from '../../src/types/models';
import { theme } from '../../src/styles/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Calendar, Link as LinkIcon, Trash2, Edit, Clock } from 'lucide-react-native';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Reuniao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const meetingId = Number(id);

  const fetchMeeting = useCallback(async () => {
    if (!meetingId) {
      setError('ID da reunião inválido.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await meetingService.getMeetingById(meetingId);
      setMeeting(data);
    } catch (e: any) {
      setError('Não foi possível carregar os detalhes da reunião.');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useFocusEffect(
    useCallback(() => {
      fetchMeeting();
    }, [fetchMeeting])
  );

  const handleDelete = () => {
    Alert.alert(
      'Excluir Reunião',
      'Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await meetingService.deleteMeeting(meetingId);
              Alert.alert('Sucesso', 'Reunião excluída.');
              router.back();
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir a reunião.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error || !meeting) {
    return <Text style={styles.errorText}>{error || 'Reunião não encontrada.'}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalhes da Reunião', headerBackTitle: 'Voltar' }} />

      <Card>
        <Text style={styles.title}>{meeting.titulo}</Text>
        <Text style={styles.description}>{meeting.descricao}</Text>

        <View style={styles.infoRow}>
          <Calendar size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            {new Date(meeting.data.endsWith('Z') ? meeting.data : meeting.data + 'Z').toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            {new Date(meeting.data.endsWith('Z') ? meeting.data : meeting.data + 'Z').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {meeting.link && (
          <TouchableOpacity style={styles.infoRow}>
            <LinkIcon size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, styles.linkText]}>Acessar link da reunião</Text>
          </TouchableOpacity>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Editar"
          onPress={() => router.push(`/meeting/edit/${meeting.id}`)}
          icon={<Edit size={18} color="white" />}
        />
        <Button
          title="Excluir"
          onPress={handleDelete}
          variant="danger"
          icon={<Trash2 size={18} color="white" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: theme.colors.error, textAlign: 'center', marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.md },
  description: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg, lineHeight: 22 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  linkText: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
});