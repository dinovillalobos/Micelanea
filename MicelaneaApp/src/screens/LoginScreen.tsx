import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <LinearGradient
        colors={['#0a0a0f', '#1a0a2e', '#0a0a0f']}
        style={styles.gradient}
      >
        <View style={styles.gridOverlay}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={[styles.gridLine, { left: i * 20 }]} />
          ))}
          {[...Array(40)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 20 }]} />
          ))}
        </View>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow}>
              <Text style={styles.title}>◈ MICELÁNEA</Text>
            </View>
            <Text style={styles.subtitle}>SISTEMA POS v2.0</Text>
            <View style={styles.decorator}>
              <View style={styles.decoratorLine} />
              <Text style={styles.decoratorText}>◢ CYBER EDITION ◣</Text>
              <View style={styles.decoratorLine} />
            </View>
          </View>

          <Surface style={styles.formContainer} elevation={0}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>// ACCESO</Text>
              <Text style={styles.formSubtitle}>Ingresa tus credenciales</Text>
            </View>
            
            <TextInput
              label="Usuario"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              outlineColor="#00f0ff"
              activeOutlineColor="#00f0ff"
              textColor="#e0e0e0"
              left={<TextInput.Icon icon="account" color="#00f0ff" />}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              outlineColor="#00f0ff"
              activeOutlineColor="#00f0ff"
              textColor="#e0e0e0"
              left={<TextInput.Icon icon="lock" color="#00f0ff" />}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>⚠ {error}</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading || !username.trim() || !password.trim()}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor="#00f0ff"
              textColor="#000000"
            >
              ═══ INICIAR SESIÓN ═══
            </Button>
          </Surface>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ▓▓▓ SISTEMA DE GESTIÓN ▓▓▓
            </Text>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  gradient: {
    flex: 1,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#00f0ff',
  },
  gridLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#00f0ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGlow: {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00f0ff',
    textShadowColor: '#00f0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#ff00ff',
    marginTop: 8,
    letterSpacing: 8,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  decorator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  decoratorLine: {
    width: 50,
    height: 2,
    backgroundColor: '#39ff14',
  },
  decoratorText: {
    color: '#39ff14',
    fontSize: 10,
    marginHorizontal: 10,
    letterSpacing: 2,
  },
  formContainer: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
    borderWidth: 1,
    borderColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  formHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00f0ff',
    letterSpacing: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#8888aa',
    marginTop: 5,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 7, 58, 0.2)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff073a',
    marginBottom: 16,
  },
  error: {
    color: '#ff073a',
    textAlign: 'center',
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00f0ff',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#39ff14',
    fontSize: 10,
    letterSpacing: 3,
  },
});
