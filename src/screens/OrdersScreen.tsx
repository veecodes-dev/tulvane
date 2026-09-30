import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getOrderStatuses } from '../api';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { money, useStore } from '../store';
import { ScreenHeader } from '../ui';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function OrdersScreen() {
  const { orders } = useStore();
  const [statuses, setStatuses] = useState<Record<string, { status: string }>>({});

  // Ask the server for the latest status of each order (the shop owner changes it in the admin page).
  useFocusEffect(
    useCallback(() => {
      if (orders.length === 0) return;
      getOrderStatuses(orders.map((o) => o.id))
        .then((r) => setStatuses(r.orders))
        .catch(() => {});
    }, [orders])
  );
  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <ScreenHeader title="My orders" />
      <ScrollView contentContainerStyle={st.scroll}>
        {orders.length === 0 && <Text style={st.empty}>No orders yet. When you pay, your order shows here.</Text>}
        {orders.map((o) => (
          <View key={o.id} style={st.card}>
            <View style={st.top}>
              <Text style={st.id}>{o.id}</Text>
              <Text style={st.status}>{statuses[o.id]?.status || 'Preparing'}</Text>
            </View>
            {o.items.map((i, idx) => (
              <Text key={idx} style={st.item}>{i.qty} × {i.name} ({i.size})</Text>
            ))}
            <Text style={st.meta}>Deliver on {fmt(o.deliveryDate)} to {o.address}</Text>
            {!!o.note && <Text style={st.meta}>Message: "{o.note}"</Text>}
            <Text style={st.total}>{money(o.total)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40, gap: 12, maxWidth: 720, width: '100%', alignSelf: 'center' },
  empty: { fontFamily: fonts.body, color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 16, gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  id: { fontFamily: fonts.bold, color: colors.deep, fontSize: 16 },
  status: { fontFamily: fonts.bold, color: colors.sage, fontSize: 13 },
  item: { fontFamily: fonts.body, color: colors.deep, fontSize: 14 },
  meta: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginTop: 4 },
  total: { fontFamily: fonts.bold, color: colors.clay, fontSize: 17, marginTop: 6 },
});
