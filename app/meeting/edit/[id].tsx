import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator, View, Text } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MeetingForm, MeetingFormData } from '../../../src/screens/MeetingForm';
import { UpdateReuniaoDTO, Reuniao } from '../../../src/types/models';
import meetingService from '../../../src/services/meetingService';
import { theme } from '../../../src/styles/theme';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function EditMeetingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const meetingId = Number(id);

  const [meeting, setMeeting] = useState<Reuniao | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { usuario } = useAuth();

  const fetchMeeting = useCallback(async () => {
    if (!meetingId) {
      setError('ID da reunião inválido.');
      setLoading(false);
      return;
    }
    try {
      const data = await meetingService.getMeetingById(meetingId);
      setMeeting(data);
    } catch (e: any) {
      setError('Não foi possível carregar os dados da reunião.');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const handleSave = async (formData: MeetingFormData) => {
    if (!usuario) {
      Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    setIsSaving(true);
    try {
      // Combina a data selecionada com a hora selecionada
      const combinedDateTime = new Date(formData.data);
      combinedDateTime.setUTCHours(formData.time.getUTCHours());
      combinedDateTime.setUTCMinutes(formData.time.getUTCMinutes());
      combinedDateTime.setUTCSeconds(0);
      combinedDateTime.setUTCMilliseconds(0);

      const meetingData: UpdateReuniaoDTO = {
        ...formData,
        data: combinedDateTime.toISOString(),
        usuarioId: usuario.id, // Adiciona o ID do usuário
      };
      await meetingService.updateMeeting(meetingId, meetingData);
      Alert.alert('Sucesso', 'Reunião atualizada com sucesso!');
      // Navega duas telas para trás: da edição para a lista, pulando os detalhes.
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Erro ao Salvar', error.message || 'Não foi possível atualizar a reunião.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error || !meeting) {
    return <Text style={styles.errorText}>{error || 'Reunião não encontrada.'}</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Editar Reunião' }} />
      <MeetingForm initialData={meeting} onSave={handleSave} isSaving={isSaving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { color: theme.colors.error, textAlign: 'center', marginTop: 20 },
});