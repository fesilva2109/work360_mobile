import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tarefa } from '../types/models';
import { theme } from '../styles/theme';
import { Card } from './Card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';

interface TaskCardProps {
  tarefa: Tarefa;
  onPress?: () => void;
  onComplete?: () => void;
}

export function TaskCard({ tarefa, onPress, onComplete }: TaskCardProps) {
  const getPriorityColor = () => {
    switch (tarefa.prioridade) {
      case 'ALTA':
        return theme.colors.alta;
      case 'MEDIA':
        return theme.colors.media;
      case 'BAIXA':
        return theme.colors.baixa;
      default:
        return theme.colors.textLight;
    }
  };

  const getPriorityIcon = () => {
    switch (tarefa.prioridade) {
      case 'ALTA':
        return <AlertCircle size={16} color={theme.colors.alta} />;
      case 'MEDIA':
        return <Clock size={16} color={theme.colors.media} />;
      case 'BAIXA':
        return <CheckCircle size={16} color={theme.colors.baixa} />;
      default:
        return null;
    }
  };

  const isCompleted = tarefa.status === 'CONCLUIDA';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, isCompleted && styles.completedCard]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {onComplete && (
              <TouchableOpacity onPress={onComplete} style={styles.checkbox}>
                {isCompleted && <CheckCircle size={20} color={theme.colors.success} />}
                {!isCompleted && <View style={styles.emptyCheckbox} />}
              </TouchableOpacity>
            )}
            <Text
              style={[
                styles.title,
                isCompleted && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {tarefa.titulo}
            </Text>
          </View>
        </View>

        {tarefa.descricao && (
          <Text style={styles.description} numberOfLines={2}>
            {tarefa.descricao}
          </Text>
        )}

        <View style={styles.footer}>
          {tarefa.prioridade && (
            <View style={styles.priorityBadge}>
              {getPriorityIcon()}
              <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
                {tarefa.prioridade}
              </Text>
            </View>
          )}

          {tarefa.estimativa && (
            <View style={styles.estimateBadge}>
              <Clock size={14} color={theme.colors.textSecondary} />
              <Text style={styles.estimateText}>{tarefa.estimativa}h</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  completedCard: {
    opacity: 0.6,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  emptyCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textLight,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  estimateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estimateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
