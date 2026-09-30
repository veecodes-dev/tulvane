import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius } from './theme';
import { Product } from './data';
import { money, useStore } from './store';

// Every photo gets the same crop, corners and soft cream layer, so the set looks like one style.
export function ProductImage({ product, height = 140 }: { product: Product; height?: number }) {
  const [width, setWidth] = useState(0);
  const [iw, ih] = product.imageSize;
  // "Cover" crop, but centered on the flowers (focusY) instead of the middle of the photo.
  const scale = width ? Math.max(width / iw, height / ih) : 1;
  const w = iw * scale;
  const h = ih * scale;
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height, borderRadius: radius.img, overflow: 'hidden', backgroundColor: colors.sageLight }}>
      {width > 0 && (
        <Image
          source={product.image}
          style={{ position: 'absolute', width: w, height: h, left: -(w - width) / 2, top: -(h - height) * product.focusY }}
          accessibilityLabel={product.name}
        />
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, opacity: 0.16 }]} />
    </View>
  );
}

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
      <ProductImage product={product} />
      <Text style={s.cardName} numberOfLines={1}>{product.name}</Text>
      <Text style={s.cardShort} numberOfLines={1}>{product.short}</Text>
      <Text style={s.cardPrice}>{money(product.price)}</Text>
    </Pressable>
  );
}

export function Button({ label, onPress, variant = 'solid', disabled, style }: { label: string; onPress: () => void; variant?: 'solid' | 'soft'; disabled?: boolean; style?: ViewStyle }) {
  const soft = variant === 'soft';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, soft && s.btnSoft, disabled && { opacity: 0.4 }, pressed && { opacity: 0.85 }, style]}
    >
      <Text style={[s.btnText, soft && { color: colors.deep }]}>{label}</Text>
    </Pressable>
  );
}

export function ScreenHeader({ title }: { title: string }) {
  const nav = useNavigation<any>();
  const { count } = useStore();
  return (
    <View style={s.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {title === 'Tulvane' && <Image source={require('../assets/logo-mark.png')} style={{ width: 34, height: 34 }} accessibilityLabel="Tulvane logo" />}
        <Text style={s.logo}>{title}</Text>
      </View>
      <Pressable accessibilityLabel="Open cart" onPress={() => nav.navigate('Cart')} style={s.bag}>
        <Ionicons name="bag-outline" size={22} color={colors.deep} />
        {count > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{count}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.card, padding: 8 },
  cardName: { fontFamily: fonts.bold, color: colors.deep, fontSize: 14, marginTop: 8 },
  cardShort: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, marginTop: 2 },
  cardPrice: { fontFamily: fonts.bold, color: colors.clay, fontSize: 15, marginTop: 6, marginBottom: 2 },
  btn: { backgroundColor: colors.deep, borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center' },
  btnSoft: { backgroundColor: colors.sageLight },
  btnText: { fontFamily: fonts.bold, color: '#fff', fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  logo: { fontFamily: fonts.title, fontSize: 28, color: colors.deep },
  bag: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.sageLight, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: fonts.bold },
});
