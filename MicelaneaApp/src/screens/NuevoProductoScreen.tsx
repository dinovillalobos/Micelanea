import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import apiService from '../services/api';
import { Producto } from '../types';

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
      Alert.alert('Error', 'Por favor completa los campos requeridos');
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
      Alert.alert('Éxito', 'Producto registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo registrar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.form} elevation={2}>
        <Text style={styles.title}>Nuevo Producto</Text>

        <TextInput
          label="Código de barras *"
          value={form.codigo_barra}
          onChangeText={(text) => setForm({ ...form, codigo_barra: text })}
          mode="outlined"
          style={styles.input}
          right={<TextInput.Icon icon="barcode" />}
        />

        <TextInput
          label="Nombre del producto *"
          value={form.nombre}
          onChangeText={(text) => setForm({ ...form, nombre: text })}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Descripción"
          value={form.descripcion}
          onChangeText={(text) => setForm({ ...form, descripcion: text })}
          mode="outlined"
          multiline
          numberOfLines={2}
          style={styles.input}
        />

        <View style={styles.row}>
          <TextInput
            label="Precio *"
            value={form.precio}
            onChangeText={(text) => setForm({ ...form, precio: text })}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            left={<TextInput.Affix text="$" />}
          />
          <TextInput
            label="Cantidad inicial"
            value={form.cantidad}
            onChangeText={(text) => setForm({ ...form, cantidad: text })}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
        </View>

        <TextInput
          label="Categoría"
          value={form.categoria}
          onChangeText={(text) => setForm({ ...form, categoria: text })}
          mode="outlined"
          style={styles.input}
          placeholder="Ej: Bebidas, Botanas, Lacteos"
        />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Guardar
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
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
  },
});
