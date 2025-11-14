import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { User, Mail, Lock } from 'lucide-react-native';

export function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { nome: '', email: '', senha: '', confirmarSenha: '' };

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório';
      valid = false;
    }

    if (!email) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!senha) {
      newErrors.senha = 'Senha é obrigatória';
      valid = false;
    } else if (senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
      valid = false;
    }

    if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await signUp({ nome, email, senha });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Comece sua jornada de produtividade</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            value={nome}
            onChangeText={setNome}
            error={errors.nome}
            leftIcon={<User size={20} color={theme.colors.textLight} />}
          />

          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Mail size={20} color={theme.colors.textLight} />}
          />

          <Input
            label="Senha"
            placeholder="••••••••"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            error={errors.senha}
            leftIcon={<Lock size={20} color={theme.colors.textLight} />}
          />

          <Input
            label="Confirmar senha"
            placeholder="••••••••"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            error={errors.confirmarSenha}
            leftIcon={<Lock size={20} color={theme.colors.textLight} />}
          />

          <Button
            title="Criar conta"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.registerButton}
          />

          <Button
            title="Já tenho conta"
            variant="outline"
            onPress={() => router.back()}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginBottom: theme.spacing.md,
  },
});
