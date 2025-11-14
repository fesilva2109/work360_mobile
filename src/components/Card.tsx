import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../styles/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

export function Card({ children, variant = 'default', style, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && theme.shadows.medium,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
