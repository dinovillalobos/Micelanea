import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';

interface NuevoProductoScreenProps {
  navigation: any;
  route: any;
}

export default function NuevoProductoScreen({ navigation, route }: NuevoProductoScreenProps) {
  const initialCodigo = route.params?.codigo || '';
  
  const [form, setForm] = useState({
    codigo_barra: initialCodigo,
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    categoria: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.codigo_barra.trim() || !form.nombre.trim() || !form.precio) {
      Alert.alert('⚠ ERROR', 'Completa los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await apiService.createProducto({
        codigo_barra: form.codigo_barra,
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        cantidad: parseInt(form.cantidad) || 0,
        categoria: form.categoria,
      });
      Alert.alert('✓ ÉXITO', 'Producto registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('ERROR', error.response?.data?.message || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <LinearGradient colors={['#0a0a0f', '#1a0a2e']} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
          <Surface style={styles.form} elevation={0}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>// NUEVO PRODUCTO</Text>
              <Text style={styles.subtitle}>Agregar al inventario</Text>
            </View>

            <TextInput
              label="Código de barras *"
              value={form.codigo_barra}
              onChangeText={(text) => setForm({ ...form, codigo_barra: text })}
              mode="outlined"
              style={styles.input}
              outlineColor="#00f0ff"
              activeOutlineColor="#00f0ff"
              textColor="#e0e0e0"
              left={<TextInput.Icon icon="barcode" color="#00f0ff" />}
            />

            <TextInput
              label="Nombre del producto *"
              value={form.nombre}
              onChangeText={(text) => setForm({ ...form, nombre: text })}
              mode="outlined"
              style={styles.input}
              outlineColor="#00f0ff"
              activeOutlineColor="#00f0ff"
              textColor="#e0e0e0"
            />

            <TextInput
              label="Descripción"
              value={form.descripcion}
              onChangeText={(text) => setForm({ ...form, descripcion: text })}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              outlineColor="#00f0ff"
              activeOutlineColor="#00f0ff"
              textColor="#e0e0e0"
            />

            <View style={styles.row}>
              <TextInput
                label="Precio *"
                value={form.precio}
                onChangeText={(text) => setForm({ ...form, precio: text })}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                outlineColor="#00f0ff"
                activeOutlineColor="#00f0ff"
                textColor="#e0e0e0"
                left={<TextInput.Affix text="$" color="#00f0ff" />}
              />
              <TextInput
                label="Cantidad"
                value={form.cantidad}
                onChangeText={(text) => setForm({ ...form, cantidad: text })}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                outlineColor="#00f0ff"
                activeOutlineColor="#00f0ff"
                textColor="#e0e0e0"
              />
            </View>

            <TextInput
              label="Categoría"
              value={form.categoria}
              onChangeText={(text) => setForm({ ...form, categoria: text })}
              mode="outlined"
              style={styles.input}
              outlineColor="#00f0ff"
              activeOutlineColor="#00f0ff"
              textColor="#e0e0e0"
              placeholder="Ej: Bebidas, Botanas, Lacteos"
              placeholderTextColor="#666"
            />

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                textColor="#ff00ff"
              >
                CANCELAR
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#00f0ff"
                textColor="#000000"
              >
                ═══ GUARDAR ═══
              </Button>
            </View>
          </Surface>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
    borderWidth: 1,
    borderColor: '#00f0ff',
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00f0ff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8888aa',
    marginTop: 5,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
});
