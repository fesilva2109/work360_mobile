import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { Mail, Lock } from 'lucide-react-native';

export function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({ email: '', senha: '' });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', senha: '' };

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

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signIn({ email, senha });
      // Redireciona para a tela principal após o login bem-sucedido
      router.replace('/(tabs)');
    } catch (error: any) {
      // Se o backend retornar 404, significa que o usuário não existe.
      if (error.response?.status === 404) {
        Alert.alert(
          'Usuário não encontrado',
          'Não encontramos uma conta com este email. Deseja criar uma nova conta?',
          [
            { text: 'Não', style: 'cancel' },
            {
              text: 'Sim, criar conta',
              onPress: () => router.push({
                pathname: '/register',
                params: { email: email } 
              }),
            },
          ]
        );
      } else {
        // Para outros erros, mostra uma mensagem genérica.
        const errorMessage = error.response?.data?.erro || 'Credenciais inválidas. Verifique seu email e senha.';
        Alert.alert('Erro no Login', errorMessage);
      }
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
          <Text style={styles.title}>Work360</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
        </View>

        <View style={styles.form}>
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

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <Button
            title="Criar conta"
            variant="outline"
            onPress={() => router.push('/register')}
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginBottom: theme.spacing.md,
  },
});