import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, IconButton, FAB, Searchbar, Divider } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { Producto } from '../types';

interface CajaScreenProps {
  navigation: any;
}

export default function CajaScreen({ navigation }: CajaScreenProps) {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerActive, setScannerActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Producto[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  
  const { items, agregarProducto, getTotal, getSubtotal, getDescuento, descuentoInfo, limpiarCarrito } = useCarrito();
  const { usuario } = useAuth();

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannerActive(false);

    try {
      const producto = await apiService.getProductoByCodigo(data);
      if (producto) {
        agregarProducto(producto);
      } else {
        Alert.alert(
          'Producto no encontrado',
          `El código ${data} no está registrado. ¿Desea registrarlo?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Registrar', onPress: () => navigation.navigate('NuevoProducto', { codigo: data }) },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo buscar el producto');
    }

    setTimeout(() => setScanned(false), 2000);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const resultados = await apiService.searchProductos(query);
        setSearchResults(resultados);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddFromSearch = (producto: Producto) => {
    agregarProducto(producto);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handlePayment = async () => {
    if (items.length === 0) return;

    const total = getTotal();
    const monto = parseFloat(montoRecibido);

    if (metodoPago === 'efectivo' && monto < total) {
      Alert.alert('Error', 'El monto recibido es menor al total');
      return;
    }

    try {
      await apiService.createVenta({
        usuario_id: usuario!.id,
        descuento: getDescuento(),
        metodo_pago: metodoPago,
        productos: items.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio,
        })),
      });

      Alert.alert(
        'Venta completada',
        metodoPago === 'efectivo' 
          ? `Cambio: $${(monto - total).toFixed(2)}`
          : 'Pago procesado correctamente',
        [{ text: 'OK', onPress: () => limpiarCarrito() }]
      );
      
      setShowPayment(false);
      setMontoRecibido('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la venta');
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text>Cargando...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Necesitamos acceso a la cámara para escanear códigos</Text>
        <Button mode="contained" onPress={requestPermission} style={styles.permissionButton}>
          Dar permiso
        </Button>
      </View>
    );
  }

  const renderItem = ({ item }: { item: { producto: Producto; cantidad: number; subtotal: number } }) => (
    <Surface style={styles.cartItem} elevation={1}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.producto.nombre}</Text>
        <Text style={styles.itemPrice}>${item.producto.precio.toFixed(2)} x {item.cantidad}</Text>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemSubtotal}>${item.subtotal.toFixed(2)}</Text>
        <IconButton
          icon="delete"
          iconColor="#f44336"
          size={20}
          onPress={() => agregarProducto(item.producto)}
        />
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <Text style={styles.headerTitle}>Caja - {usuario?.nombre}</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="magnify"
            onPress={() => setShowSearch(true)}
          />
          <IconButton
            icon="barcode-scan"
            onPress={() => setScannerActive(true)}
          />
        </View>
      </Surface>

      {/* Escáner */}
      {scannerActive && (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.scanner}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>Apunta al código de barras</Text>
            </View>
          </CameraView>
          <Button
            mode="contained"
            onPress={() => setScannerActive(false)}
            style={styles.closeScanner}
          >
            Cerrar
          </Button>
        </View>
      )}

      {/* Carrito */}
      {items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyText}>Escanea un producto o busca en el catálogo</Text>
          <Button mode="contained" icon="magnify" onPress={() => setShowSearch(true)}>
            Buscar producto
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.producto.id.toString()}
            style={styles.list}
          />

          <Surface style={styles.totalContainer} elevation={3}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>${getSubtotal().toFixed(2)}</Text>
            </View>
            {descuentoInfo && (
              <View style={styles.totalRow}>
                <Text style={styles.discountText}>
                  Descuento ({descuentoInfo.tipo === 'porcentaje' ? `${descuentoInfo.valor}%` : `$${descuentoInfo.valor}`}):
                </Text>
                <Text style={styles.discountText}>-${getDescuento().toFixed(2)}</Text>
              </View>
            )}
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => setShowPayment(true)}
              style={styles.payButton}
              contentStyle={styles.payButtonContent}
            >
              Cobrar
            </Button>
          </Surface>
        </>
      )}

      {/* Modal de búsqueda */}
      <Modal visible={showSearch} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buscar Producto</Text>
            <IconButton icon="close" onPress={() => setShowSearch(false)} />
          </View>
          <Searchbar
            placeholder="Buscar por nombre o código..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
          />
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAddFromSearch(item)}>
                <Surface style={styles.searchItem} elevation={1}>
                  <View>
                    <Text style={styles.searchItemName}>{item.nombre}</Text>
                    <Text style={styles.searchItemCode}>{item.codigo_barra}</Text>
                  </View>
                  <Text style={styles.searchItemPrice}>${item.precio.toFixed(2)}</Text>
                </Surface>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal de pago */}
      <Modal visible={showPayment} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Finalizar Venta</Text>
            <IconButton icon="close" onPress={() => setShowPayment(false)} />
          </View>
          
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTotal}>Total: ${getTotal().toFixed(2)}</Text>
            
            <Text style={styles.paymentLabel}>Método de pago:</Text>
            <View style={styles.paymentMethods}>
              {(['efectivo', 'tarjeta', 'transferencia'] as const).map((method) => (
                <Button
                  key={method}
                  mode={metodoPago === method ? 'contained' : 'outlined'}
                  onPress={() => setMetodoPago(method)}
                  style={styles.methodButton}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Button>
              ))}
            </View>

            {metodoPago === 'efectivo' && (
              <TextInput
                label="Monto recibido"
                value={montoRecibido}
                onChangeText={setMontoRecibido}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Affix text="$" />}
              />
            )}

            <Button
              mode="contained"
              onPress={handlePayment}
              style={styles.confirmButton}
              contentStyle={styles.confirmButtonContent}
            >
              Confirmar Venta
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  text: {
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    marginHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  scannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: '#000',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 10,
  },
  scannerText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  closeScanner: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  totalContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountText: {
    color: '#4CAF50',
  },
  divider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  payButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchbar: {
    margin: 16,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  searchItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchItemCode: {
    fontSize: 12,
    color: '#999',
  },
  searchItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  paymentContent: {
    padding: 20,
  },
  paymentTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2196F3',
  },
  paymentLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 20,
  },
  confirmButton: {
    marginTop: 20,
  },
  confirmButtonContent: {
    paddingVertical: 8,
  },
});
