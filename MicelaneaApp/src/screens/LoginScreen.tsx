import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    try {
      await login({ username, password });
    } catch (err) {
      // Error ya manejado en el contexto
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Surface style={styles.logoContainer} elevation={0}>
          <Text style={styles.title}>Micelánea</Text>
          <Text style={styles.subtitle}>Sistema de Punto de Venta</Text>
        </Surface>

        <Surface style={styles.formContainer} elevation={2}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>
          
          <TextInput
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            left={<TextInput.Icon icon="lock" />}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || !username.trim() || !password.trim()}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Entrar
          </Button>
        </Surface>

        <Text style={styles.footer}>
          Sistema de gestión para tu micelánea
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});
