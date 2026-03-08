import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Surface, SegmentedButtons, Card, Divider } from 'react-native-paper';
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
      Alert.alert('Error', 'No se pudieron cargar los reportes');
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
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderVenta = ({ item }: { item: Venta }) => (
    <Card style={styles.ventaCard}>
      <Card.Content>
        <View style={styles.ventaHeader}>
          <Text style={styles.ventaId}>Venta #{item.id}</Text>
          <Text style={styles.ventaFecha}>{formatFecha(item.created_at)}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.ventaDetails}>
          <View style={styles.ventaDetail}>
            <Text style={styles.detailLabel}>Método</Text>
            <Text style={styles.detailValue}>{item.metodo_pago}</Text>
          </View>
          <View style={styles.ventaDetail}>
            <Text style={styles.detailLabel}>Usuario</Text>
            <Text style={styles.detailValue}>{item.usuario_nombre || 'N/A'}</Text>
          </View>
          {item.descuento > 0 && (
            <View style={styles.ventaDetail}>
              <Text style={styles.detailLabel}>Descuento</Text>
              <Text style={styles.discountValue}>-${item.descuento.toFixed(2)}</Text>
            </View>
          )}
        </View>
        <View style={styles.ventaTotal}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text style={styles.headerTitle}>Reportes</Text>
      </Surface>

      <SegmentedButtons
        value={periodo}
        onValueChange={(value) => setPeriodo(value as 'hoy' | 'semana' | 'mes')}
        buttons={[
          { value: 'hoy', label: 'Hoy' },
          { value: 'semana', label: 'Semana' },
          { value: 'mes', label: 'Mes' },
        ]}
        style={styles.segmented}
      />

      <Surface style={styles.statsContainer} elevation={2}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalVentas}</Text>
          <Text style={styles.statLabel}>Ventas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalMonto.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${promedio.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Promedio</Text>
        </View>
      </Surface>

      <Text style={styles.listTitle}>Historial de ventas</Text>

      <FlatList
        data={ventas}
        renderItem={renderVenta}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No hay ventas en este período</Text>
          </View>
        }
      />
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
  segmented: {
    margin: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  ventaCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  ventaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ventaId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ventaFecha: {
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  ventaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ventaDetail: {
    width: '50%',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  discountValue: {
    fontSize: 14,
    color: '#4CAF50',
  },
  ventaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2196F3',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
