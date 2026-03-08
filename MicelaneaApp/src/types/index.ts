export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: 'admin' | 'empleado';
  activo: boolean;
  created_at?: string;
}

export interface Producto {
  id: number;
  codigo_barra: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
  categoria?: string;
  imagen_url?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Venta {
  id: number;
  usuario_id: number;
  total: number;
  descuento: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  status: 'completada' | 'cancelada';
  created_at: string;
  detalles?: VentaDetalle[];
  usuario_nombre?: string;
}

export interface VentaDetalle {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
}

export interface Descuento {
  id: number;
  codigo: string;
  tipo: 'porcentaje' | 'monto';
  valor: number;
  activo: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface VentaRequest {
  usuario_id: number;
  descuento: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  productos: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}
