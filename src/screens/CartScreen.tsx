import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { findProduct } from '../data';
import { itemName, money, useStore } from '../store';
import { Button, ProductImage } from '../ui';

export const DELIVERY_FEE = 4.9;
export const FREE_FROM = 50;
export const deliveryFor = (subtotal: number) => (subtotal >= FREE_FROM || subtotal === 0 ? 0 : DELIVERY_FEE);

export default function CartScreen({ navigation }: any) {
  const { cart, subtotal, changeQty } = useStore();
  const delivery = deliveryFor(subtotal);

  if (cart.length === 0)
    return (
      <View style={[st.root, st.empty]}>
        <Text style={{ fontSize: 48 }}>🛍️</Text>
        <Text style={st.emptyTitle}>Your cart is empty</Text>
        <Text style={st.emptyText}>Add some flowers to start.</Text>
        <Button label="Go to shop" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
      </View>
    );

  return (
    <View style={st.root}>
      <ScrollView contentContainerStyle={st.scroll}>
        {cart.map((i) => (
          <View key={i.key} style={st.row}>
            <View style={{ width: 72 }}>
              <ProductImage product={findProduct(i.productId)} height={72} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.name}>{itemName(i)}</Text>
              <Text style={st.size}>{i.size}</Text>
              <Text style={st.price}>{money(i.unitPrice * i.qty)}</Text>
            </View>
            <View style={st.qty}>
              <Pressable accessibilityLabel="Less" onPress={() => changeQty(i.key, -1)} style={st.qBtn}><Text style={st.qText}>−</Text></Pressable>
              <Text style={st.qNum}>{i.qty}</Text>
              <Pressable accessibilityLabel="More" onPress={() => changeQty(i.key, 1)} style={st.qBtn}><Text style={st.qText}>+</Text></Pressable>
            </View>
          </View>
        ))}

        <View style={st.sum}>
          <View style={st.line}><Text style={st.sumText}>Subtotal</Text><Text style={st.sumText}>{money(subtotal)}</Text></View>
          <View style={st.line}><Text style={st.sumText}>Delivery</Text><Text style={st.sumText}>{delivery === 0 ? 'Free' : money(delivery)}</Text></View>
          {delivery > 0 && <Text style={st.hint}>Add {money(FREE_FROM - subtotal)} more for free delivery.</Text>}
          <View style={[st.line, st.totalLine]}><Text style={st.total}>Total</Text><Text style={st.total}>{money(subtotal + delivery)}</Text></View>
        </View>
      </ScrollView>
      <View style={st.bar}>
        <Button label="Checkout" onPress={() => navigation.navigate('Checkout')} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 10, padding: 30 },
  emptyTitle: { fontFamily: fonts.title, fontSize: 24, color: colors.deep },
  emptyText: { fontFamily: fonts.body, color: colors.muted, marginBottom: 10 },
  scroll: { padding: 20, paddingBottom: 120, gap: 10, maxWidth: 720, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, padding: 10 },
  name: { fontFamily: fonts.bold, color: colors.deep, fontSize: 15 },
  size: { fontFamily: fonts.body, color: colors.muted, fontSize: 13 },
  price: { fontFamily: fonts.bold, color: colors.clay, marginTop: 4 },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.sageLight, alignItems: 'center', justifyContent: 'center' },
  qText: { fontFamily: fonts.bold, fontSize: 18, color: colors.deep, lineHeight: 20 },
  qNum: { fontFamily: fonts.bold, color: colors.deep, minWidth: 16, textAlign: 'center' },
  sum: { backgroundColor: colors.card, borderRadius: radius.card, padding: 16, marginTop: 8, gap: 8 },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  sumText: { fontFamily: fonts.body, color: colors.deep, fontSize: 15 },
  hint: { fontFamily: fonts.body, color: colors.sage, fontSize: 13 },
  totalLine: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 4 },
  total: { fontFamily: fonts.bold, color: colors.deep, fontSize: 18 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 16, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line },
});
