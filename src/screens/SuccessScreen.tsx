import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { Button } from '../ui';

export default function SuccessScreen({ route, navigation }: any) {
  return (
    <View style={st.root}>
      <Text style={{ fontSize: 56 }}>💐</Text>
      <Text style={st.h}>Thank you!</Text>
      <Text style={st.p}>Your order {route.params.id} is paid (test mode). We are preparing your flowers.</Text>
      <Button label="See my orders" onPress={() => navigation.navigate('Tabs', { screen: 'Orders' })} />
      <Button label="Keep shopping" variant="soft" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  h: { fontFamily: fonts.title, color: colors.deep, fontSize: 30 },
  p: { fontFamily: fonts.body, color: colors.deep, fontSize: 16, textAlign: 'center', marginBottom: 10, maxWidth: 360 },
});
