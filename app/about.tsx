import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, TouchableOpacity, Linking, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { theme } from '../src/styles/theme';
import { Info, Github, Mail, Code } from 'lucide-react-native';
import { Button } from '../src/components/Button';

const developers = [
  { name: 'Felipe Silva', github: 'https://github.com/fesilva2109' },
  { name: 'Eduardo Nagado', github: 'https://github.com/EduNagado' },
  { name: 'Gustavo Lazzuri', github: 'https://github.com/guLazzuri' },
];

const technologies = ['React Native', 'Expo', 'TypeScript', 'Expo Router', 'Axios', 'Spring Boot'];

export default function AboutScreen() {
  const commitHash = Constants.expoConfig?.extra?.commitHash || 'N/A';
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Sobre o App' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Info size={48} color={theme.colors.primary} />
          <Text style={styles.title}>Work360</Text>
          <Text style={styles.subtitle} selectable>
            Versão 1.0.0 - Hash do Commit ({commitHash})
          </Text>
        </View>

        <Text style={styles.description}>
          O Work360 é um aplicativo para gestão de produtividade, permitindo
          o controle de tarefas, reuniões e análise de desempenho com insights
          gerados por IA.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desenvolvedores</Text>
          {developers.map((dev, index) => (
            <TouchableOpacity key={index} style={styles.devRow} onPress={() => Linking.openURL(dev.github)}>
              <Github size={20} color={theme.colors.textSecondary} />
              <Text style={styles.devName}>{dev.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tecnologias Utilizadas</Text>
          <View style={styles.techContainer}>
            {technologies.map((tech, index) => (
              <View key={index} style={styles.techBadge}>
                <Text style={styles.techText}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          title="Entrar em Contato"
          onPress={() => Linking.openURL('mailto:felipesilvaa.2109@gmail.com?subject=Contato sobre o Work360')}
          leftIcon={<Mail size={18} color="white" />}
          style={styles.contactButton}
        />

        <Button
          title="Voltar"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: { alignItems: 'center', marginBottom: theme.spacing.md },
  title: { fontSize: 32, fontWeight: 'bold', color: theme.colors.text, marginTop: theme.spacing.md },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  section: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  devName: {
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  techBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  techText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  contactButton: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  backButton: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
});