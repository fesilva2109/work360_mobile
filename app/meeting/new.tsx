import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MeetingForm, MeetingFormData } from '../../src/screens/MeetingForm';
import { CreateReuniaoDTO } from '../../src/types/models';
import meetingService from '../../src/services/meetingService';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/styles/theme';

export default function NewMeetingScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData: MeetingFormData) => {
    if (!usuario) {
      Alert.alert('Erro', 'Você precisa estar logado para criar uma reunião.');
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

      const meetingData: CreateReuniaoDTO = {
        ...formData,
        data: combinedDateTime.toISOString(),
        usuarioId: usuario.id,
      };
      await meetingService.createMeeting(meetingData);
      Alert.alert('Sucesso', 'Reunião criada com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro ao Salvar', error.message || 'Não foi possível criar a reunião.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Nova Reunião', headerBackTitle: 'Voltar' }} />
      <MeetingForm onSave={handleSave} isSaving={isSaving} />
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
});