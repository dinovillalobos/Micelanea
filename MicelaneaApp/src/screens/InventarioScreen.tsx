import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, StatusBar } from 'react-native';
import { Text, Surface, FAB, Searchbar, IconButton, Menu, Divider, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';
import { Producto } from '../types';

interface InventarioScreenProps {
  navigation: any;
}

export default function InventarioScreen({ navigation }: InventarioScreenProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    categoria: '',
  });

  const loadProductos = useCallback(async () => {
    try {
      const data = await apiService.getProductos();
      setProductos(data);
      setFilteredProductos(data);
    } catch (error) {
      Alert.alert('ERROR', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.codigo_barra.includes(searchQuery)
      );
      setFilteredProductos(filtered);
    } else {
      setFilteredProductos(productos);
    }
  }, [searchQuery, productos]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProductos();
  };

  const handleEdit = (producto: Producto) => {
    setSelectedProduct(producto);
    setEditForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      cantidad: producto.cantidad.toString(),
      categoria: producto.categoria || '',
    });
    setEditModalVisible(true);
    setMenuVisible(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;
    try {
      await apiService.updateProducto(selectedProduct.id, {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        precio: parseFloat(editForm.precio),
        cantidad: parseInt(editForm.cantidad),
        categoria: editForm.categoria,
      });
      Alert.alert('✓ ÉXITO', 'Producto actualizado');
      setEditModalVisible(false);
      loadProductos();
    } catch (error) {
      Alert.alert('ERROR', 'No se pudo actualizar');
    }
  };

  const handleDelete = (producto: Producto) => {
    Alert.alert(
      '⚠ ELIMINAR PRODUCTO',
      `¿Eliminar "${producto.nombre}"?`,
      [
        { text: 'CANCELAR', style: 'cancel' },
        {
          text: 'ELIMINAR',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteProducto(producto.id);
              loadProductos();
            } catch (error) {
              Alert.alert('ERROR', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
    setMenuVisible(null);
  };

  const getStockColor = (cantidad: number) => {
    if (cantidad === 0) return '#ff073a';
    if (cantidad < 10) return '#ff00ff';
    return '#39ff14';
  };

  const renderItem = ({ item }: { item: Producto }) => (
    <Surface style={styles.productItem} elevation={1}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text style={styles.productCode}>⎔ {item.codigo_barra}</Text>
        {item.categoria && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.categoria}</Text>
          </View>
        )}
      </View>
      <View style={styles.productActions}>
        <View style={styles.productStats}>
          <Text style={styles.productPrice}>${item.precio.toFixed(2)}</Text>
          <View style={styles.stockContainer}>
            <View style={[styles.stockDot, { backgroundColor: getStockColor(item.cantidad) }]} />
            <Text style={[styles.productStock, { color: getStockColor(item.cantidad) }]}>
              {item.cantidad} uds
            </Text>
          </View>
        </View>
        <Menu
          visible={menuVisible === item.id}
          onDismiss={() => setMenuVisible(null)}
          anchor={
            <IconButton icon="dots-vertical" iconColor="#00f0ff" onPress={() => setMenuVisible(item.id)} />
          }
          contentStyle={{ backgroundColor: '#12121a' }}
        >
          <Menu.Item onPress={() => handleEdit(item)} title="Editar" titleStyle={{ color: '#00f0ff' }} leadingIcon="pencil" iconColor="#00f0ff" />
          <Divider style={{ backgroundColor: '#333' }} />
          <Menu.Item onPress={() => handleDelete(item)} title="Eliminar" titleStyle={{ color: '#ff073a' }} leadingIcon="delete" iconColor="#ff073a" />
        </Menu>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <LinearGradient colors={['#0a0a0f', '#1a0a2e']} style={styles.headerGradient}>
        <Surface style={styles.header} elevation={0}>
          <View>
            <Text style={styles.headerTitle}>◈ INVENTARIO</Text>
            <Text style={styles.headerSubtitle}>┌ {productos.length} productos</Text>
          </View>
        </Surface>
      </LinearGradient>

      <Searchbar placeholder="Buscar producto..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchbar} inputStyle={{ color: '#e0e0e0' }} iconColor="#00f0ff" />

      <FlatList
        data={filteredProductos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00f0ff" />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>◈ SIN PRODUCTOS</Text></View>}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('NuevoProducto')} color="#000000" />

      <Portal>
        <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>// EDITAR PRODUCTO</Text>
          <TextInput label="Nombre" value={editForm.nombre} onChangeText={(text) => setEditForm({ ...editForm, nombre: text })} mode="outlined" style={styles.input} outlineColor="#00f0ff" activeOutlineColor="#00f0ff" textColor="#e0e0e0" />
          <TextInput label="Descripción" value={editForm.descripcion} onChangeText={(text) => setEditForm({ ...editForm, descripcion: text })} mode="outlined" style={styles.input} outlineColor="#00f0ff" activeOutlineColor="#00f0ff" textColor="#e0e0e0" />
          <View style={styles.row}>
            <TextInput label="Precio" value={editForm.precio} onChangeText={(text) => setEditForm({ ...editForm, precio: text })} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} outlineColor="#00f0ff" activeOutlineColor="#00f0ff" textColor="#e0e0e0" left={<TextInput.Affix text="$" color="#00f0ff" />} />
            <TextInput label="Cantidad" value={editForm.cantidad} onChangeText={(text) => setEditForm({ ...editForm, cantidad: text })} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} outlineColor="#00f0ff" activeOutlineColor="#00f0ff" textColor="#e0e0e0" />
          </View>
          <TextInput label="Categoría" value={editForm.categoria} onChangeText={(text) => setEditForm({ ...editForm, categoria: text })} mode="outlined" style={styles.input} outlineColor="#00f0ff" activeOutlineColor="#00f0ff" textColor="#e0e0e0" />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setEditModalVisible(false)} textColor="#ff00ff">CANCELAR</Button>
            <Button mode="contained" onPress={handleSaveEdit} buttonColor="#00f0ff" textColor="#000000">GUARDAR</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  headerGradient: { paddingTop: 10 },
  header: { padding: 16, backgroundColor: 'transparent' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#00f0ff', letterSpacing: 4 },
  headerSubtitle: { fontSize: 12, color: '#8888aa', marginTop: 4 },
  searchbar: { margin: 16, marginBottom: 0, backgroundColor: '#12121a', borderWidth: 1, borderColor: '#1a1a25' },
  list: { padding: 16 },
  productItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, marginBottom: 8, borderRadius: 8, backgroundColor: '#12121a', borderWidth: 1, borderColor: '#1a1a25' },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '500', color: '#e0e0e0' },
  productCode: { fontSize: 12, color: '#8888aa', marginTop: 4 },
  categoryTag: { backgroundColor: 'rgba(255, 0, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8, borderWidth: 1, borderColor: '#ff00ff' },
  categoryText: { fontSize: 10, color: '#ff00ff', letterSpacing: 1 },
  productActions: { flexDirection: 'row', alignItems: 'center' },
  productStats: { alignItems: 'flex-end', marginRight: 8 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#00f0ff' },
  stockContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stockDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  productStock: { fontSize: 12, fontWeight: 'bold' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#00f0ff' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#8888aa', fontSize: 16, letterSpacing: 4 },
  modal: { backgroundColor: '#12121a', padding: 20, margin: 20, borderRadius: 12, borderWidth: 1, borderColor: '#00f0ff' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#00f0ff', marginBottom: 16, letterSpacing: 2 },
  input: { marginBottom: 12, backgroundColor: '#0a0a0f' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
});
