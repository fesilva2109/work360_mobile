import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Modal, SafeAreaView } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Reuniao } from '../types/models';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';
import { Calendar, Clock } from 'lucide-react-native';

// Exportando a interface para ser usada em outros lugares (new.tsx, edit.tsx)
export interface MeetingFormData {
  titulo: string;
  descricao?: string;
  link?: string;
  data: Date;
  time: Date;
}

interface MeetingFormProps {
  initialData?: Reuniao;
  onSave: (data: MeetingFormData) => void;
  isSaving?: boolean;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ initialData, onSave, isSaving }) => {
  // Usando um único estado para o formulário
  const [formData, setFormData] = useState<MeetingFormData>({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    link: initialData?.link || '',
    // Garante que a data vinda do backend seja tratada como UTC.
    // Adicionar 'Z' ao final da string de data força a interpretação em UTC.
    data: initialData ? new Date(initialData.data.endsWith('Z') ? initialData.data : initialData.data + 'Z') : new Date(),
    time: initialData ? new Date(initialData.data.endsWith('Z') ? initialData.data : initialData.data + 'Z') : new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.data;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setFormData(prev => ({ ...prev, data: currentDate }));
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || formData.time;
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    setFormData(prev => ({ ...prev, time: currentTime }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <View style={styles.container}>
      <Input
        label="Título"
        value={formData.titulo}
        onChangeText={(text) => setFormData({ ...formData, titulo: text })}
        placeholder="Ex: Alinhamento Semanal"
      />
      <Input
        label="Descrição"
        value={formData.descricao}
        onChangeText={(text) => setFormData({ ...formData, descricao: text })}
        multiline
        placeholder="Ex: Discutir progresso do projeto X"
      />
      <Input
        label="Link (Opcional)"
        value={formData.link}
        onChangeText={(text) => setFormData({ ...formData, link: text })}
        placeholder="https://meet.google.com/..."
      />

      <Text style={styles.label}>Data da Reunião</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
        <Calendar size={20} color={theme.colors.primary} />
        <Text style={styles.pickerText}>
          {formData.data.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>

      {/* --- Seletor de Data --- */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={formData.data}
          mode="date"
          display="default"
          onChange={handleDateChange}
          locale="pt-BR"
        />
      )}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={formData.data}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                locale="pt-BR"
                themeVariant="light"
              />
              <Button title="Confirmar" onPress={() => setShowDatePicker(false)} />
            </View>
          </SafeAreaView>
        </Modal>
      )}

      <Text style={styles.label}>Horário da Reunião</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
        <Clock size={20} color={theme.colors.primary} />
        <Text style={styles.pickerText}>
          {formData.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {/* --- Seletor de Hora --- */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          locale="pt-BR"
        />
      )}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={formData.time}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                locale="pt-BR"
                themeVariant="light"
              />
              <Button title="Confirmar" onPress={() => setShowTimePicker(false)} />
            </View>
          </SafeAreaView>
        </Modal>
      )}

      <Button
        title={isSaving ? 'Salvando...' : 'Salvar Reunião'}
        onPress={handleSubmit}
        disabled={isSaving || !formData.titulo}
        style={styles.button}
      />
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 50,
  },
  pickerText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
});