import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findProduct } from './data';

export type CartItem = { key: string; productId: string; size: string; unitPrice: number; qty: number };
export type Order = {
  id: string;
  date: string;
  deliveryDate: string;
  name: string;
  address: string;
  note: string;
  total: number;
  items: { name: string; size: string; qty: number }[];
};

type Store = {
  cart: CartItem[];
  orders: Order[];
  count: number;
  subtotal: number;
  addToCart: (productId: string, size: string, unitPrice: number) => void;
  changeQty: (key: string, delta: number) => void;
  clearCart: () => void;
  addOrder: (o: Order) => void;
};

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

const ORDERS_KEY = 'tulvane.orders';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(ORDERS_KEY)
      .then((v) => v && setOrders(JSON.parse(v)))
      .catch(() => {});
  }, []);

  const value = useMemo<Store>(
    () => ({
      cart,
      orders,
      count: cart.reduce((n, i) => n + i.qty, 0),
      subtotal: cart.reduce((n, i) => n + i.qty * i.unitPrice, 0),
      addToCart: (productId, size, unitPrice) =>
        setCart((c) => {
          const key = `${productId}|${size}`;
          if (c.some((i) => i.key === key)) return c.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
          return [...c, { key, productId, size, unitPrice, qty: 1 }];
        }),
      changeQty: (key, delta) =>
        setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)),
      clearCart: () => setCart([]),
      addOrder: (o) =>
        setOrders((prev) => {
          const next = [o, ...prev];
          AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        }),
    }),
    [cart, orders]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const itemName = (i: CartItem) => findProduct(i.productId).name;
export const money = (n: number) => `€${n.toFixed(2).replace('.00', '')}`;
