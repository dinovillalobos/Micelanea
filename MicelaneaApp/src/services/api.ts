import axios, { AxiosInstance } from 'axios';
import {
  Usuario,
  Producto,
  Venta,
  Descuento,
  LoginCredentials,
  VentaRequest,
} from '../types';

const API_URL = 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<{ token: string; usuario: Usuario }> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<Usuario> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Productos
  async getProductos(): Promise<Producto[]> {
    const response = await this.api.get('/productos');
    return response.data;
  }

  async getProductoByCodigo(codigo: string): Promise<Producto | null> {
    try {
      const response = await this.api.get(`/productos/codigo/${codigo}`);
      return response.data;
    } catch {
      return null;
    }
  }

  async getProducto(id: number): Promise<Producto> {
    const response = await this.api.get(`/productos/${id}`);
    return response.data;
  }

  async createProducto(producto: Partial<Producto>): Promise<Producto> {
    const response = await this.api.post('/productos', producto);
    return response.data;
  }

  async updateProducto(id: number, producto: Partial<Producto>): Promise<Producto> {
    const response = await this.api.put(`/productos/${id}`, producto);
    return response.data;
  }

  async deleteProducto(id: number): Promise<void> {
    await this.api.delete(`/productos/${id}`);
  }

  async searchProductos(query: string): Promise<Producto[]> {
    const response = await this.api.get(`/productos/buscar?q=${query}`);
    return response.data;
  }

  // Ventas
  async createVenta(venta: VentaRequest): Promise<Venta> {
    const response = await this.api.post('/ventas', venta);
    return response.data;
  }

  async getVentas(fecha?: string): Promise<Venta[]> {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await this.api.get(`/ventas${params}`);
    return response.data;
  }

  async getVenta(id: number): Promise<Venta> {
    const response = await this.api.get(`/ventas/${id}`);
    return response.data;
  }

  async cancelVenta(id: number): Promise<Venta> {
    const response = await this.api.put(`/ventas/${id}/cancelar`);
    return response.data;
  }

  // Reportes
  async getReporteVentas(fechaInicio: string, fechaFin: string): Promise<{
    total_ventas: number;
    total_productos: number;
    promedio_venta: number;
    ventas: Venta[];
  }> {
    const response = await this.api.get(`/reportes/ventas?inicio=${fechaInicio}&fin=${fechaFin}`);
    return response.data;
  }

  async getVentasHoy(): Promise<Venta[]> {
    const response = await this.api.get('/reportes/hoy');
    return response.data;
  }

  // Descuentos
  async getDescuentos(): Promise<Descuento[]> {
    const response = await this.api.get('/descuentos');
    return response.data;
  }

  async aplicarDescuento(codigo: string): Promise<Descuento | null> {
    try {
      const response = await this.api.post('/descuentos/aplicar', { codigo });
      return response.data;
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
