import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button, Surface, IconButton, FAB, Searchbar, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
          '⚠ PRODUCTO NO ENCONTRADO',
          `Código: ${data}\n¿Registrar nuevo producto?`,
          [
            { text: 'CANCELAR', style: 'cancel' },
            { text: 'REGISTRAR', onPress: () => navigation.navigate('NuevoProducto', { codigo: data }) },
          ]
        );
      }
    } catch (error) {
      Alert.alert('ERROR', 'No se pudo buscar el producto');
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
      Alert.alert('ERROR', 'Monto insuficiente');
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
        '✓ VENTA COMPLETADA',
        metodoPago === 'efectivo' 
          ? `CAMBIO: $${(monto - total).toFixed(2)}`
          : 'Pago procesado',
        [{ text: 'OK', onPress: () => limpiarCarrito() }]
      );
      
      setShowPayment(false);
      setMontoRecibido('');
    } catch (error) {
      Alert.alert('ERROR', 'No se pudo completar la venta');
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Cargando...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Necesitas permisos de cámara</Text>
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
          icon="plus"
          iconColor="#00f0ff"
          size={20}
          onPress={() => agregarProducto(item.producto)}
        />
        <IconButton
          icon="delete"
          iconColor="#ff073a"
          size={20}
          onPress={() => agregarProducto(item.producto)}
        />
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      
      <LinearGradient
        colors={['#0a0a0f', '#1a0a2e']}
        style={styles.headerGradient}
      >
        <Surface style={styles.header} elevation={0}>
          <View>
            <Text style={styles.headerTitle}>◈ CAJA</Text>
            <Text style={styles.headerSubtitle}>┌ {usuario?.nombre}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowSearch(true)}>
              <Text style={styles.actionIcon}>⌕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setScannerActive(true)}>
              <Text style={styles.actionIcon}>⎔</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </LinearGradient>

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
              <View style={styles.scannerFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <View style={styles.scanLine} />
              </View>
              <Text style={styles.scannerText}>◢ ESCANEANDO ◣</Text>
            </View>
          </CameraView>
          <Button
            mode="contained"
            onPress={() => setScannerActive(false)}
            style={styles.closeScanner}
            buttonColor="#ff00ff"
          >
            ╳ CERRAR
          </Button>
        </View>
      )}

      {items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyIcon}>◈</Text>
          <Text style={styles.emptyText}>ESCANEA UN PRODUCTO</Text>
          <Text style={styles.emptySubtext}>o busca en el catálogo</Text>
          <Button mode="outlined" icon="magnify" onPress={() => setShowSearch(true)} style={styles.searchButton}>
            BUSCAR PRODUCTO
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.producto.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          <Surface style={styles.totalContainer} elevation={5}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SUBTOTAL:</Text>
              <Text style={styles.totalValue}>${getSubtotal().toFixed(2)}</Text>
            </View>
            {descuentoInfo && (
              <View style={styles.totalRow}>
                <Text style={styles.discountText}>
                  DESC - {descuentoInfo.tipo === 'porcentaje' ? `${descuentoInfo.valor}%` : `$${descuentoInfo.valor}`}:
                </Text>
                <Text style={styles.discountText}>-${getDescuento().toFixed(2)}</Text>
              </View>
            )}
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>◢ TOTAL:</Text>
              <Text style={styles.grandTotalValue}>${getTotal().toFixed(2)}</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => setShowPayment(true)}
              style={styles.payButton}
              contentStyle={styles.payButtonContent}
              buttonColor="#00f0ff"
              textColor="#000000"
            >
              ═══ COBRAR ═══
            </Button>
          </Surface>
        </>
      )}

      <Modal visible={showSearch} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>// BUSCAR PRODUCTO</Text>
            <IconButton icon="close" iconColor="#00f0ff" onPress={() => setShowSearch(false)} />
          </View>
          <Searchbar
            placeholder="Buscar..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ color: '#e0e0e0' }}
            iconColor="#00f0ff"
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

      <Modal visible={showPayment} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>// FINALIZAR VENTA</Text>
            <IconButton icon="close" iconColor="#00f0ff" onPress={() => setShowPayment(false)} />
          </View>
          
          <View style={styles.paymentContent}>
            <View style={styles.paymentTotalBox}>
              <Text style={styles.paymentTotal}>TOTAL: ${getTotal().toFixed(2)}</Text>
            </View>
            
            <Text style={styles.paymentLabel}>MÉTODO DE PAGO:</Text>
            <View style={styles.paymentMethods}>
              {(['efectivo', 'tarjeta', 'transferencia'] as const).map((method) => (
                <Button
                  key={method}
                  mode={metodoPago === method ? 'contained' : 'outlined'}
                  onPress={() => setMetodoPago(method)}
                  style={styles.methodButton}
                  buttonColor={metodoPago === method ? '#00f0ff' : undefined}
                  textColor={metodoPago === method ? '#000000' : '#00f0ff'}
                >
                  {method.toUpperCase()}
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
                outlineColor="#00f0ff"
                activeOutlineColor="#00f0ff"
                textColor="#e0e0e0"
                left={<TextInput.Affix text="$" color="#00f0ff" />}
              />
            )}

            <Button
              mode="contained"
              onPress={handlePayment}
              style={styles.confirmButton}
              contentStyle={styles.confirmButtonContent}
              buttonColor="#39ff14"
              textColor="#000000"
            >
              ═══ CONFIRMAR VENTA ═══
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
    backgroundColor: '#0a0a0f',
  },
  text: {
    color: '#e0e0e0',
  },
  permissionButton: {
    marginHorizontal: 40,
    backgroundColor: '#00f0ff',
  },
  headerGradient: {
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00f0ff',
    letterSpacing: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8888aa',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 20,
    color: '#00f0ff',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 150,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00f0ff',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  scannerText: {
    color: '#00f0ff',
    marginTop: 20,
    fontSize: 14,
    letterSpacing: 4,
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
  emptyIcon: {
    fontSize: 64,
    color: '#00f0ff',
    marginBottom: 20,
    textShadowColor: '#00f0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#e0e0e0',
    letterSpacing: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8888aa',
    marginTop: 8,
    marginBottom: 20,
  },
  searchButton: {
    borderColor: '#00f0ff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: '#1a1a25',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e0e0e0',
  },
  itemPrice: {
    fontSize: 14,
    color: '#8888aa',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00f0ff',
    marginRight: 8,
  },
  totalContainer: {
    padding: 16,
    backgroundColor: '#12121a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    color: '#8888aa',
    fontSize: 14,
  },
  totalValue: {
    color: '#e0e0e0',
    fontSize: 14,
  },
  discountText: {
    color: '#39ff14',
    fontSize: 14,
  },
  divider: {
    backgroundColor: '#00f0ff',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00f0ff',
    letterSpacing: 2,
  },
  grandTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00f0ff',
    textShadowColor: '#00f0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    backgroundColor: '#0a0a0f',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00f0ff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00f0ff',
    letterSpacing: 2,
  },
  searchbar: {
    margin: 16,
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: '#00f0ff',
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: '#1a1a25',
  },
  searchItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e0e0e0',
  },
  searchItemCode: {
    fontSize: 12,
    color: '#8888aa',
    marginTop: 4,
  },
  searchItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00f0ff',
  },
  paymentContent: {
    padding: 20,
  },
  paymentTotalBox: {
    backgroundColor: '#12121a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00f0ff',
    marginBottom: 20,
    alignItems: 'center',
  },
  paymentTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00f0ff',
    textShadowColor: '#00f0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#8888aa',
    marginBottom: 10,
    letterSpacing: 2,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: '#00f0ff',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#12121a',
  },
  confirmButton: {
    marginTop: 20,
  },
  confirmButtonContent: {
    paddingVertical: 8,
  },
});
