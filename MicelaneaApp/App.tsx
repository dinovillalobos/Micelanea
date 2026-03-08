import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CarritoProvider } from './src/context/CarritoContext';
import AppNavigator from './src/navigation/AppNavigator';

const cyberpunkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#00f0ff',
    secondary: '#ff00ff',
    tertiary: '#39ff14',
    background: '#0a0a0f',
    surface: '#12121a',
    surfaceVariant: '#1a1a25',
    error: '#ff073a',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#e0e0e0',
    onSurface: '#e0e0e0',
    outline: '#00f0ff',
    elevation: {
      level0: '#0a0a0f',
      level1: '#12121a',
      level2: '#1a1a25',
      level3: '#22222f',
      level4: '#2a2a3a',
      level5: '#323245',
    },
  },
  roundness: 12,
};

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00f0ff',
    background: '#0a0a0f',
    card: '#12121a',
    text: '#e0e0e0',
    border: '#1a1a25',
    notification: '#ff00ff',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={cyberpunkTheme}>
        <AuthProvider>
          <CarritoProvider>
            <NavigationContainer theme={navTheme}>
              <AppNavigator />
            </NavigationContainer>
          </CarritoProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
