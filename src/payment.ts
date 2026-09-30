import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { createCheckout, CheckoutInput, getSession } from './api';
import { Order } from './store';

// The order is saved here before we open Stripe, and finished when the customer comes back paid.
const PENDING_KEY = 'tulvane.pending';

export const savePending = (sessionId: string, order: Order) => AsyncStorage.setItem(PENDING_KEY, JSON.stringify({ sessionId, order }));
export const clearPending = () => AsyncStorage.removeItem(PENDING_KEY);

export async function loadPending(): Promise<{ sessionId: string; order: Order } | null> {
  try {
    const v = await AsyncStorage.getItem(PENDING_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export type PayResult = 'paid' | 'redirected' | 'canceled' | 'demo';

/**
 * Starts a Stripe payment. On web the page goes to Stripe and comes back. On a phone a browser sheet opens.
 * The server creates the order and its id, so we return the order with the real id.
 */
export async function startPayment(input: Omit<CheckoutInput, 'returnUrl'>, draft: Order): Promise<{ result: PayResult; order: Order }> {
  const returnUrl = Platform.OS === 'web' ? window.location.origin + '/' : undefined;
  const r = await createCheckout({ ...input, returnUrl });
  const order = { ...draft, id: r.orderId };
  if (r.demo) return { result: 'demo', order };
  if (!r.url || !r.sessionId) throw new Error('Could not start the payment.');

  await savePending(r.sessionId, order);

  if (Platform.OS === 'web') {
    window.location.href = r.url;
    return { result: 'redirected', order };
  }
  await WebBrowser.openBrowserAsync(r.url);
  const s = await getSession(r.sessionId);
  return { result: s.paid ? 'paid' : 'canceled', order };
}
