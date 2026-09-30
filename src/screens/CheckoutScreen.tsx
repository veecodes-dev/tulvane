import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { itemName, money, Order, useStore } from '../store';
import { Button } from '../ui';
import { deliveryFor } from './CartScreen';
import { startPayment } from '../payment';

const dayLabel = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function deliveryDays() {
  const now = new Date();
  const start = now.getHours() < 14 ? 0 : 1; // same-day only before 14:00
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + start + i);
    return d;
  });
}

export default function CheckoutScreen({ navigation }: any) {
  const { cart, subtotal, clearCart, addOrder } = useStore();
  const days = deliveryDays();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [dayIdx, setDayIdx] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  const delivery = deliveryFor(subtotal);
  const total = subtotal + delivery;

  const finish = (order: Order) => {
    addOrder(order);
    clearCart();
    navigation.reset({ index: 1, routes: [{ name: 'Tabs', params: { screen: 'Orders' } }, { name: 'Success', params: { id: order.id } }] });
  };

  const pay = async () => {
    setError('');
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (address.trim().length < 6) return setError('Please enter your delivery address.');
    setPaying(true);
    const draft: Order = {
      id: '', // the server creates the real order id
      date: new Date().toISOString(),
      deliveryDate: days[dayIdx].toISOString(),
      name: name.trim(),
      address: address.trim(),
      note: note.trim(),
      total,
      items: cart.map((i) => ({ name: itemName(i), size: i.size, qty: i.qty })),
    };
    try {
      const { result, order } = await startPayment(
        {
          items: cart.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
          name: draft.name,
          address: draft.address,
          deliveryDate: draft.deliveryDate,
          note: draft.note,
        },
        draft
      );
      if (result === 'redirected') return; // the page is going to Stripe
      if (result === 'paid' || result === 'demo') return finish(order);
      setError('Payment was not finished. You can try again.');
    } catch (e: any) {
      setError(e?.message === 'Failed to fetch' ? 'Cannot reach the shop server. Is it running?' : e?.message || 'Something went wrong.');
    }
    setPaying(false);
  };

  if (cart.length === 0)
    return (
      <View style={[st.root, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={st.h}>Nothing to pay for</Text>
        <Button label="Back to shop" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
      </View>
    );

  return (
    <View style={st.root}>
      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
        <Text style={st.h}>Delivery</Text>
        <TextInput style={st.input} placeholder="Full name" placeholderTextColor={colors.muted} value={name} onChangeText={setName} />
        <TextInput style={st.input} placeholder="Street, number, city" placeholderTextColor={colors.muted} value={address} onChangeText={setAddress} />

        <Text style={st.label}>Delivery day</Text>
        <View style={st.days}>
          {days.map((d, i) => (
            <Pressable key={d.toISOString()} onPress={() => setDayIdx(i)} style={[st.day, i === dayIdx && st.dayOn]}>
              <Text style={[st.dayText, i === dayIdx && { color: '#fff' }]}>{dayLabel(d)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={st.label}>Card message (optional)</Text>
        <TextInput style={[st.input, { height: 80, textAlignVertical: 'top' }]} multiline maxLength={150} placeholder="Write a short message" placeholderTextColor={colors.muted} value={note} onChangeText={setNote} />

        <Text style={st.h}>Payment</Text>
        <View style={st.test}>
          <Text style={st.testText}>
            You pay on the secure Stripe page. This is a demo in test mode: no real money is taken. Test card: 4242 4242 4242 4242, any future date, any 3 numbers.
          </Text>
        </View>

        {!!error && <Text style={st.error}>{error}</Text>}
      </ScrollView>
      <View style={st.bar}>
        <Button label={paying ? 'Opening payment…' : `Pay ${money(total)}`} onPress={pay} disabled={paying} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 120, gap: 10, maxWidth: 720, width: '100%', alignSelf: 'center' },
  h: { fontFamily: fonts.title, color: colors.deep, fontSize: 22, marginTop: 6 },
  label: { fontFamily: fonts.bold, color: colors.deep, marginTop: 6 },
  input: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.body, fontSize: 15, color: colors.deep },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  day: { backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line },
  dayOn: { backgroundColor: colors.sage, borderColor: colors.sage },
  dayText: { fontFamily: fonts.bold, color: colors.deep, fontSize: 13 },
  test: { backgroundColor: colors.sageLight, borderRadius: 14, padding: 12 },
  testText: { fontFamily: fonts.body, color: colors.deep, fontSize: 13, lineHeight: 18 },
  error: { fontFamily: fonts.bold, color: colors.error, marginTop: 4 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 16, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line },
});
