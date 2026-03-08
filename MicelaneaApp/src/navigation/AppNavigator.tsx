import React from 'react';
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

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Caja"
        component={CajaScreen}
        options={{
          tabBarLabel: 'Caja',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-register" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventario"
        component={InventarioScreen}
        options={{
          tabBarLabel: 'Inventario',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{
          tabBarLabel: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
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
              title: 'Nuevo Producto',
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#2196F3',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
