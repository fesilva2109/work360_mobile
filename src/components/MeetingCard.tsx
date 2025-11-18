import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Reuniao } from '../types/models';
import { theme } from '../styles/theme';
import { Card } from './Card';
import { Calendar, Link, Clock } from 'lucide-react-native';

interface MeetingCardProps {
  reuniao: Reuniao;
  onPress?: () => void;
}

export function MeetingCard({ reuniao, onPress }: MeetingCardProps) {
  const formattedDate = new Date(reuniao.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedTime = new Date(reuniao.data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleLinkPress = () => {
    if (reuniao.link) {
      Linking.openURL(reuniao.link);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {reuniao.titulo}
          </Text>
          {reuniao.link && (
            <TouchableOpacity onPress={handleLinkPress} style={styles.linkButton}>
              <Link size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {reuniao.descricao && (
          <Text style={styles.description} numberOfLines={3}>
            {reuniao.descricao}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.infoBadge}>
            <Calendar size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{formattedTime}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  linkButton: {
    padding: theme.spacing.xs,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
