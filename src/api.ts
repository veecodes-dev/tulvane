import { Platform } from 'react-native';

// Where the shop server lives:
// - Online (website served by the server): the same address as the page.
// - On your computer: port 8787 (or EXPO_PUBLIC_API_URL, for example for a phone on the same Wi-Fi).
const onLocalPage = Platform.OS === 'web' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const API_URL = Platform.OS === 'web' && !onLocalPage ? window.location.origin : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';

async function call<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.demo) throw new Error(data.error || `Server error ${res.status}`);
  return data as T;
}

export type CheckoutInput = {
  items: { productId: string; size: string; qty: number }[];
  name: string;
  address: string;
  deliveryDate: string;
  note: string;
  returnUrl?: string;
};

export const createCheckout = (input: CheckoutInput) =>
  call<{ url?: string; sessionId?: string; total?: number; demo?: boolean; orderId: string }>('/api/checkout', { method: 'POST', body: JSON.stringify(input) });

export const getOrderStatuses = (ids: string[]) =>
  call<{ orders: Record<string, { status: string; total: number }> }>('/api/orders/status', { method: 'POST', body: JSON.stringify({ ids }) });

export const getSession = (id: string) => call<{ paid: boolean }>(`/api/session/${encodeURIComponent(id)}`);

export const chat = (messages: { role: 'user' | 'assistant'; content: string }[]) =>
  call<{ reply?: string; demo?: boolean }>('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) });
