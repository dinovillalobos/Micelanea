import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, StatusBar } from 'react-native';
import { Text, Surface, SegmentedButtons, Card, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';
import { Venta } from '../types';

interface ReportesScreenProps {
  navigation: any;
}

export default function ReportesScreen({ navigation }: ReportesScreenProps) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  const getFechaParams = () => {
    const today = new Date();
    let inicio: string, fin: string;
    switch (periodo) {
      case 'semana':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        inicio = weekStart.toISOString().split('T')[0];
        fin = today.toISOString().split('T')[0];
        break;
      case 'mes':
        const monthStart = new Date(today);
        monthStart.setMonth(today.getMonth() - 1);
        inicio = monthStart.toISOString().split('T')[0];
        fin = today.toISOString().split('T')[0];
        break;
      case 'hoy':
      default:
        inicio = today.toISOString().split('T')[0];
        fin = today.toISOString().split('T')[0];
        break;
    }
    return { inicio, fin };
  };

  const loadVentas = useCallback(async () => {
    try {
      const { inicio, fin } = getFechaParams();
      const data = await apiService.getReporteVentas(inicio, fin);
      setVentas(data.ventas);
    } catch (error) {
      Alert.alert('ERROR', 'No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodo]);

  useEffect(() => {
    loadVentas();
  }, [loadVentas]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVentas();
  };

  const getTotales = () => {
    const totalVentas = ventas.length;
    const totalMonto = ventas.reduce((sum, v) => sum + v.total, 0);
    const promedio = totalVentas > 0 ? totalMonto / totalVentas : 0;
    return { totalVentas, totalMonto, promedio };
  };

  const { totalVentas, totalMonto, promedio } = getTotales();

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const renderVenta = ({ item }: { item: Venta }) => (
    <Card style={styles.ventaCard}>
      <Card.Content>
        <View style={styles.ventaHeader}>
          <Text style={styles.ventaId}>◈ VENTA #{item.id}</Text>
          <Text style={styles.ventaFecha}>{formatFecha(item.created_at)}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.ventaDetails}>
          <View style={styles.ventaDetail}>
            <Text style={styles.detailLabel}>MÉTODO</Text>
            <Text style={styles.detailValue}>{item.metodo_pago}</Text>
          </View>
          <View style={styles.ventaDetail}>
            <Text style={styles.detailLabel}>USUARIO</Text>
            <Text style={styles.detailValue}>{item.usuario_nombre || 'N/A'}</Text>
          </View>
          {item.descuento > 0 && (
            <View style={styles.ventaDetail}>
              <Text style={styles.detailLabel}>DESCUENTO</Text>
              <Text style={styles.discountValue}>-${item.descuento.toFixed(2)}</Text>
            </View>
          )}
        </View>
        <View style={styles.ventaTotal}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <LinearGradient colors={['#0a0a0f', '#1a0a2e']} style={styles.headerGradient}>
        <Surface style={styles.header} elevation={0}>
          <Text style={styles.headerTitle}>◈ REPORTES</Text>
        </Surface>
      </LinearGradient>

      <SegmentedButtons
        value={periodo}
        onValueChange={(value) => setPeriodo(value as 'hoy' | 'semana' | 'mes')}
        buttons={[
          { value: 'hoy', label: 'HOY', style: { backgroundColor: periodo === 'hoy' ? '#00f0ff' : '#12121a' } },
          { value: 'semana', label: 'SEMANA', style: { backgroundColor: periodo === 'semana' ? '#00f0ff' : '#12121a' } },
          { value: 'mes', label: 'MES', style: { backgroundColor: periodo === 'mes' ? '#00f0ff' : '#12121a' } },
        ]}
        style={styles.segmented}
      />

      <Surface style={styles.statsContainer} elevation={2}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalVentas}</Text>
          <Text style={styles.statLabel}>VENTAS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalMonto.toFixed(2)}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${promedio.toFixed(2)}</Text>
          <Text style={styles.statLabel}>PROMEDIO</Text>
        </View>
      </Surface>

      <Text style={styles.listTitle}>// HISTORIAL DE VENTAS</Text>

      <FlatList
        data={ventas}
        renderItem={renderVenta}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00f0ff" />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>◈ SIN VENTAS</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  headerGradient: { paddingTop: 10 },
  header: { padding: 16, backgroundColor: 'transparent' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#00f0ff', letterSpacing: 4 },
  segmented: { margin: 16 },
  statsContainer: { flexDirection: 'row', marginHorizontal: 16, padding: 16, borderRadius: 12, backgroundColor: '#12121a', borderWidth: 1, borderColor: '#00f0ff' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#00f0ff', textShadowColor: '#00f0ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  statLabel: { fontSize: 10, color: '#8888aa', marginTop: 4, letterSpacing: 2 },
  statDivider: { width: 1, backgroundColor: '#333' },
  listTitle: { fontSize: 14, fontWeight: '600', marginHorizontal: 16, marginTop: 16, marginBottom: 8, color: '#00f0ff', letterSpacing: 2 },
  list: { padding: 16, paddingTop: 0 },
  ventaCard: { marginBottom: 8, backgroundColor: '#12121a', borderWidth: 1, borderColor: '#1a1a25' },
  ventaHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  ventaId: { fontWeight: 'bold', fontSize: 14, color: '#00f0ff', letterSpacing: 2 },
  ventaFecha: { color: '#8888aa', fontSize: 12 },
  divider: { marginVertical: 8, backgroundColor: '#333' },
  ventaDetails: { flexDirection: 'row', flexWrap: 'wrap' },
  ventaDetail: { width: '50%', marginBottom: 4 },
  detailLabel: { fontSize: 10, color: '#666', letterSpacing: 1 },
  detailValue: { fontSize: 14, color: '#e0e0e0', textTransform: 'capitalize' },
  discountValue: { fontSize: 14, color: '#39ff14' },
  ventaTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalLabel: { fontWeight: 'bold', fontSize: 14, color: '#8888aa', letterSpacing: 2 },
  totalValue: { fontWeight: 'bold', fontSize: 18, color: '#00f0ff', textShadowColor: '#00f0ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#8888aa', fontSize: 16, letterSpacing: 4 },
});
