import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from './theme';
import { findProduct, occasions } from './data';
import { ProductImage } from './ui';

// "Which bouquet for which occasion?" helper. Tap an occasion, read the tip, tap a bouquet.
export function OccasionGuide({ onOpen }: { onOpen: (productId: string) => void }) {
  const [id, setId] = useState(occasions[0].id);
  const occ = occasions.find((o) => o.id === id)!;

  return (
    <View style={st.wrap}>
      <Text style={st.h}>Which bouquet for which moment?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>
        {occasions.map((o) => (
          <Pressable key={o.id} onPress={() => setId(o.id)} style={[st.chip, o.id === id && st.chipOn]}>
            <Text style={[st.chipText, o.id === id && { color: '#fff' }]}>{o.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={st.box}>
        <Text style={st.tip}>{occ.tip}</Text>
        <View style={st.row}>
          {occ.products.map((pid) => {
            const p = findProduct(pid);
            return (
              <Pressable key={pid} onPress={() => onOpen(pid)} style={st.item}>
                <ProductImage product={p} height={96} />
                <Text style={st.name} numberOfLines={2}>{p.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { marginTop: 24 },
  h: { fontFamily: fonts.title, color: colors.deep, fontSize: 22, marginBottom: 12 },
  chips: { gap: 8, paddingBottom: 12 },
  chip: { backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.sage, borderColor: colors.sage },
  chipText: { fontFamily: fonts.bold, color: colors.deep, fontSize: 13 },
  box: { backgroundColor: colors.sageLight, borderRadius: 22, padding: 16, gap: 12 },
  tip: { fontFamily: fonts.body, color: colors.deep, fontSize: 15, lineHeight: 22 },
  row: { flexDirection: 'row', gap: 10 },
  item: { flex: 1, maxWidth: 160 },
  name: { fontFamily: fonts.bold, color: colors.deep, fontSize: 12, marginTop: 6 },
});
