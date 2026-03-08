import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CarritoProvider } from './src/context/CarritoContext';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03A9F4',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <CarritoProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </CarritoProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
