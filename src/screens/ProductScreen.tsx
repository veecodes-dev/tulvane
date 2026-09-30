import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { findProduct, occasionsFor } from '../data';
import { money, useStore } from '../store';
import { Button, ProductImage } from '../ui';

export default function ProductScreen({ route, navigation }: any) {
  const product = findProduct(route.params.id);
  const { addToCart } = useStore();
  const [sizeIdx, setSizeIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const size = product.sizes[sizeIdx];
  const price = product.price + size.extra;

  const add = () => {
    addToCart(product.id, size.label, price);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <View style={st.root}>
      <ScrollView contentContainerStyle={st.scroll}>
        <ProductImage product={product} height={260} />
        <Text style={st.cat}>{product.category}</Text>
        <Text style={st.name}>{product.name}</Text>
        <Text style={st.price}>{money(price)}</Text>
        <Text style={st.desc}>{product.description}</Text>

        <Text style={st.label}>Good for</Text>
        <View style={st.sizes}>
          {occasionsFor(product.id).map((o) => (
            <View key={o.id} style={st.tag}><Text style={st.tagText}>{o.label}</Text></View>
          ))}
        </View>

        <Text style={st.label}>Size</Text>
        <View style={st.sizes}>
          {product.sizes.map((sz, i) => (
            <Pressable key={sz.label} onPress={() => setSizeIdx(i)} style={[st.size, i === sizeIdx && st.sizeOn]}>
              <Text style={[st.sizeText, i === sizeIdx && { color: '#fff' }]}>{sz.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={st.bar}>
        <Button label={added ? 'Added ✓' : `Add to cart · ${money(price)}`} onPress={add} style={{ flex: 1 }} />
        <Button label="Cart" variant="soft" onPress={() => navigation.navigate('Cart')} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 120, maxWidth: 720, width: '100%', alignSelf: 'center' },
  cat: { fontFamily: fonts.bold, color: colors.sage, fontSize: 13, marginTop: 16 },
  name: { fontFamily: fonts.title, color: colors.deep, fontSize: 30, marginTop: 4 },
  price: { fontFamily: fonts.bold, color: colors.clay, fontSize: 22, marginTop: 6 },
  desc: { fontFamily: fonts.body, color: colors.deep, fontSize: 16, lineHeight: 24, marginTop: 14 },
  label: { fontFamily: fonts.bold, color: colors.deep, marginTop: 22, marginBottom: 8 },
  sizes: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  size: { backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 10, paddingHorizontal: 18, borderWidth: 1, borderColor: colors.line },
  sizeOn: { backgroundColor: colors.sage, borderColor: colors.sage },
  tag: { backgroundColor: colors.sageLight, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  tagText: { fontFamily: fonts.bold, color: colors.deep, fontSize: 12 },
  sizeText: { fontFamily: fonts.bold, color: colors.deep },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, padding: 16, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line },
});
