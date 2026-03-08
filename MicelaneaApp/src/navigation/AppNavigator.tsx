import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import CajaScreen from '../screens/CajaScreen';
import InventarioScreen from '../screens/InventarioScreen';
import NuevoProductoScreen from '../screens/NuevoProductoScreen';
import ReportesScreen from '../screens/ReportesScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons
        name={name as any}
        size={24}
        color={focused ? '#00f0ff' : '#666'}
      />
      {focused && <View style={styles.glowDot} />}
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00f0ff',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#0a0a0f',
          borderTopWidth: 1,
          borderTopColor: '#00f0ff',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Caja"
        component={CajaScreen}
        options={{
          tabBarLabel: 'CAJA',
          tabBarIcon: ({ focused }) => <TabIcon name="cash-register" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Inventario"
        component={InventarioScreen}
        options={{
          tabBarLabel: 'INVENTARIO',
          tabBarIcon: ({ focused }) => <TabIcon name="package-variant" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{
          tabBarLabel: 'REPORTES',
          tabBarIcon: ({ focused }) => <TabIcon name="chart-bar" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>◈ CARGANDO ◈</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="NuevoProducto"
            component={NuevoProductoScreen}
            options={{
              headerShown: true,
              title: '// NUEVO PRODUCTO',
              headerStyle: { backgroundColor: '#0a0a0f' },
              headerTintColor: '#00f0ff',
              headerTitleStyle: { letterSpacing: 2 },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00f0ff',
    fontSize: 18,
    letterSpacing: 4,
    textShadowColor: '#00f0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
