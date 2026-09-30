import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { categories, products } from '../data';
import { ProductCard, ScreenHeader } from '../ui';

export default function ShopScreen({ navigation }: any) {
  const [cat, setCat] = useState<(typeof categories)[number]>('All');
  const list = cat === 'All' ? products : products.filter((p) => p.category === cat);
  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <ScreenHeader title="Shop" />
      <View style={st.chips}>
        {categories.map((c) => (
          <Pressable key={c} onPress={() => setCat(c)} style={[st.chip, cat === c && st.chipOn]}>
            <Text style={[st.chipText, cat === c && { color: '#fff' }]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={st.scroll}>
        <View style={st.grid}>
          {list.map((p) => (
            <View key={p.id} style={st.cell}>
              <ProductCard product={p} onPress={() => navigation.navigate('Product', { id: p.id })} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8, flexWrap: 'wrap', maxWidth: 720, width: '100%', alignSelf: 'center' },
  chip: { backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.sage, borderColor: colors.sage },
  chipText: { fontFamily: fonts.bold, color: colors.deep, fontSize: 13 },
  scroll: { padding: 15, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '50%', padding: 5 },
});
