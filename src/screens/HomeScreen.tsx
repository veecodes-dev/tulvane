import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { products } from '../data';
import { Button, ProductCard, ScreenHeader } from '../ui';
import { OccasionGuide } from '../OccasionGuide';

export default function HomeScreen({ navigation }: any) {
  const popular = products.slice(0, 4);
  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <ScreenHeader title="Tulvane" />
      <ScrollView contentContainerStyle={st.scroll}>
        <View style={st.hero}>
          <Text style={st.small}>Same-day delivery</Text>
          <Text style={st.h1}>Fresh flowers for every day</Text>
          <Text style={st.p}>Order before 14:00 and we bring them today.</Text>
          <Button label="Shop now" onPress={() => navigation.navigate('Shop')} style={{ alignSelf: 'flex-start' }} />
        </View>

        <View style={st.tips}>
          <View style={st.tip}><Text style={st.tipIcon}>🚚</Text><Text style={st.tipText}>Free delivery from €50</Text></View>
          <View style={st.tip}><Text style={st.tipIcon}>💬</Text><Text style={st.tipText}>Ask our chat helper</Text></View>
        </View>

        <OccasionGuide onOpen={(id) => navigation.navigate('Product', { id })} />

        <Text style={st.h2}>Popular now</Text>
        <View style={st.grid}>
          {popular.map((p) => (
            <View key={p.id} style={st.cell}>
              <ProductCard product={p} onPress={() => navigation.navigate('Product', { id: p.id })} />
            </View>
          ))}
        </View>
        <Text style={st.demo}>Demo shop for a portfolio. Not a real business.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  hero: { backgroundColor: colors.sageLight, borderRadius: 24, padding: 22, gap: 8 },
  small: { fontFamily: fonts.bold, color: colors.sage, fontSize: 13 },
  h1: { fontFamily: fonts.title, color: colors.deep, fontSize: 30, lineHeight: 36 },
  p: { fontFamily: fonts.body, color: colors.deep, fontSize: 15, marginBottom: 8 },
  tips: { flexDirection: 'row', gap: 10, marginTop: 14 },
  tip: { flex: 1, backgroundColor: colors.card, borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipIcon: { fontSize: 20 },
  tipText: { flex: 1, fontFamily: fonts.bold, color: colors.deep, fontSize: 13 },
  h2: { fontFamily: fonts.title, color: colors.deep, fontSize: 22, marginTop: 24, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { width: '50%', padding: 5 },
  demo: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 24 },
});
