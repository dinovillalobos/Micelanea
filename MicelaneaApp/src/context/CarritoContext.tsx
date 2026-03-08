import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CarritoItem, Producto, Descuento } from '../types';

interface CarritoContextType {
  items: CarritoItem[];
  descuento: number;
  descuentoInfo: Descuento | null;
  agregarProducto: (producto: Producto) => void;
  quitarProducto: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  aplicarDescuento: (codigo: string) => Promise<boolean>;
  quitarDescuento: () => void;
  limpiarCarrito: () => void;
  getTotal: () => number;
  getTotalConDescuento: () => number;
  getSubtotal: () => number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CarritoItem[]>([]);
  const [descuentoInfo, setDescuentoInfo] = useState<Descuento | null>(null);

  const agregarProducto = (producto: Producto) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.producto.id === producto.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.producto.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.producto.precio,
              }
            : item
        );
      }
      
      return [
        ...prevItems,
        {
          producto,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ];
    });
  };

  const quitarProducto = (productoId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.producto.id !== productoId));
  };

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      quitarProducto(productoId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.producto.id === productoId
          ? {
              ...item,
              cantidad,
              subtotal: cantidad * item.producto.precio,
            }
          : item
      )
    );
  };

  const aplicarDescuento = async (codigo: string): Promise<boolean> => {
    try {
      const api = (await import('../services/api')).default;
      const descuento = await api.aplicarDescuento(codigo);
      if (descuento) {
        setDescuentoInfo(descuento);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const quitarDescuento = () => {
    setDescuentoInfo(null);
  };

  const limpiarCarrito = () => {
    setItems([]);
    setDescuentoInfo(null);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    if (!descuentoInfo) return subtotal;

    if (descuentoInfo.tipo === 'porcentaje') {
      return subtotal - (subtotal * descuentoInfo.valor) / 100;
    }
    return subtotal - descuentoInfo.valor;
  };

  const getTotalConDescuento = getTotal;

  const getDescuento = (): number => {
    const subtotal = getSubtotal();
    if (!descuentoInfo) return 0;

    if (descuentoInfo.tipo === 'porcentaje') {
      return (subtotal * descuentoInfo.valor) / 100;
    }
    return descuentoInfo.valor;
  };

  return (
    <CarritoContext.Provider
      value={{
        items,
        descuento: getDescuento(),
        descuentoInfo,
        agregarProducto,
        quitarProducto,
        actualizarCantidad,
        aplicarDescuento,
        quitarDescuento,
        limpiarCarrito,
        getTotal,
        getTotalConDescuento,
        getSubtotal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito must be used within a CarritoProvider');
  }
  return context;
}
