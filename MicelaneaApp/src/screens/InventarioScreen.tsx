import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { Text, Surface, FAB, Searchbar, IconButton, Menu, Divider, Portal, Modal, TextInput, Button } from 'react-native-paper';
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
      Alert.alert('Error', 'No se pudieron cargar los productos');
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
      Alert.alert('Éxito', 'Producto actualizado');
      setEditModalVisible(false);
      loadProductos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    }
  };

  const handleDelete = (producto: Producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Está seguro de eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteProducto(producto.id);
              loadProductos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
    setMenuVisible(null);
  };

  const getStockColor = (cantidad: number) => {
    if (cantidad === 0) return '#f44336';
    if (cantidad < 10) return '#ff9800';
    return '#4CAF50';
  };

  const renderItem = ({ item }: { item: Producto }) => (
    <Surface style={styles.productItem} elevation={1}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text style={styles.productCode}>{item.codigo_barra}</Text>
        {item.categoria && <Text style={styles.productCategory}>{item.categoria}</Text>}
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
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(item.id)}
            />
          }
        >
          <Menu.Item
            onPress={() => handleEdit(item)}
            title="Editar"
            leadingIcon="pencil"
          />
          <Divider />
          <Menu.Item
            onPress={() => handleDelete(item)}
            title="Eliminar"
            leadingIcon="delete"
            titleStyle={{ color: '#f44336' }}
          />
        </Menu>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text style={styles.headerTitle}>Inventario</Text>
        <Text style={styles.headerSubtitle}>{productos.length} productos</Text>
      </Surface>

      <Searchbar
        placeholder="Buscar producto..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredProductos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No hay productos</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NuevoProducto')}
      />

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Editar Producto</Text>
          <TextInput
            label="Nombre"
            value={editForm.nombre}
            onChangeText={(text) => setEditForm({ ...editForm, nombre: text })}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Descripción"
            value={editForm.descripcion}
            onChangeText={(text) => setEditForm({ ...editForm, descripcion: text })}
            mode="outlined"
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput
              label="Precio"
              value={editForm.precio}
              onChangeText={(text) => setEditForm({ ...editForm, precio: text })}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              left={<TextInput.Affix text="$" />}
            />
            <TextInput
              label="Cantidad"
              value={editForm.cantidad}
              onChangeText={(text) => setEditForm({ ...editForm, cantidad: text })}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>
          <TextInput
            label="Categoría"
            value={editForm.categoria}
            onChangeText={(text) => setEditForm({ ...editForm, categoria: text })}
            mode="outlined"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setEditModalVisible(false)}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={handleSaveEdit}>
              Guardar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchbar: {
    margin: 16,
    marginBottom: 0,
  },
  list: {
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productCode: {
    fontSize: 12,
    color: '#999',
  },
  productCategory: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productStats: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  productStock: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
