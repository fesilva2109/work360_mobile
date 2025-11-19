import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { CreateReuniaoDTO, Reuniao } from '../types/models';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';

interface MeetingFormProps {
  initialData?: Reuniao;
  onSave: (data: CreateReuniaoDTO) => Promise<void>;
  isSaving?: boolean;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ initialData, onSave, isSaving }) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [data, setData] = useState(initialData ? new Date(initialData.data) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || data;
    setShowDatePicker(Platform.OS === 'ios');
    setData(currentDate);
    if (Platform.OS !== 'ios') {
      setShowTimePicker(true); // Abre o seletor de hora em seguida no Android
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || data;
    setShowTimePicker(Platform.OS === 'ios');
    // Combina data e hora
    const newDate = new Date(data);
    newDate.setHours(currentTime.getHours());
    newDate.setMinutes(currentTime.getMinutes());
    setData(newDate);
  };

  const handleSubmit = () => {
    const meetingData: CreateReuniaoDTO = {
      titulo,
      descricao,
      link,
      data: data.toISOString(),
    };
    onSave(meetingData);
  };

  return (
    <View style={styles.container}>
      <Input label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ex: Alinhamento Semanal" />
      <Input label="Descrição" value={descricao} onChangeText={setDescricao} multiline placeholder="Ex: Discutir progresso do projeto X" />
      <Input label="Link (Opcional)" value={link} onChangeText={setLink} placeholder="https://meet.google.com/..." />

      <Text style={styles.label}>Data e Hora</Text>
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerText}>{data.toLocaleString('pt-BR')}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={data}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Button title={isSaving ? 'Salvando...' : 'Salvar Reunião'} onPress={handleSubmit} disabled={isSaving} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  datePickerButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
});