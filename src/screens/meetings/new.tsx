import React from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MeetingForm } from '../../components/MeetingForm';
import { CreateReuniaoDTO } from '../../types/models';
import meetingService from '../../services/meetingService';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export default function NewMeetingScreen() {
  const router = useRouter();
  const { usuario } = useAuth();

  const handleSave = async (data: CreateReuniaoDTO) => {
    if (!usuario) {
      Alert.alert('Erro', 'Você precisa estar logado para criar uma reunião.');
      return;
    }

    try {

      await meetingService.createMeeting(data);
      Alert.alert('Sucesso', 'Reunião criada com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro ao Salvar', error.message || 'Não foi possível criar a reunião.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Nova Reunião' }} />
      <MeetingForm onSave={handleSave} />
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