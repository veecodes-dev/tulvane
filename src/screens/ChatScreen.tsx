import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { askBot } from '../bot';
import { chat } from '../api';
import { products } from '../data';
import { ScreenHeader } from '../ui';

type Msg = { id: number; from: 'me' | 'bot'; text: string; productIds?: string[] };
const suggestions = ['Which bouquet for a birthday?', 'How does delivery work?', 'Can I change my delivery day?', 'How do I keep flowers fresh?'];

// The AI writes product ids like {{blush-rose}}. We remove them from the text and show tappable cards.
function parseReply(reply: string) {
  const ids: string[] = [];
  const text = reply
    .replace(/[*_#`]+/g, '') // the app shows plain text, so remove markdown marks
    .replace(/\p{Extended_Pictographic}️?/gu, '') // and emojis, to keep the shop style calm
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s*\{\{([a-z-]+)\}\}/g, (_m, id) => {
      if (products.some((p) => p.id === id) && !ids.includes(id)) ids.push(id);
      return '';
    })
    .trim();
  return { text, productIds: ids };
}

export default function ChatScreen({ navigation }: any) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: 'bot', text: 'Hi! I am Tully, your flower helper. I can help you choose a bouquet, plan delivery, or answer questions about your order.' },
  ]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const send = async (t: string) => {
    const q = t.trim();
    if (!q || busy) return;
    setText('');
    setBusy(true);
    const history = [...msgs.filter((m) => m.id !== 0), { id: Date.now(), from: 'me' as const, text: q }];
    setMsgs((m) => [...m, history[history.length - 1]]);

    let reply = '';
    try {
      const r = await chat(history.map((m) => ({ role: m.from === 'me' ? ('user' as const) : ('assistant' as const), content: m.text })));
      reply = r.reply || '';
    } catch {
      /* server not reachable: use the simple offline helper */
    }
    if (!reply) reply = await askBot(q);

    const parsed = parseReply(reply);
    setMsgs((m) => [...m, { id: Date.now() + 1, from: 'bot', ...parsed }]);
    setBusy(false);
  };

  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <ScreenHeader title="Chat" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={st.list} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
          {msgs.map((m) => (
            <View key={m.id} style={{ gap: 6, alignItems: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
              <View style={[st.bubble, m.from === 'me' ? st.me : st.bot]}>
                <Text style={[st.text, m.from === 'me' && { color: '#fff' }]}>{m.text}</Text>
              </View>
              {m.productIds?.map((id) => {
                const p = products.find((x) => x.id === id)!;
                return (
                  <Pressable key={id} onPress={() => navigation.navigate('Product', { id })} style={st.prod}>
                    <Text style={st.prodName}>{p.name}</Text>
                    <Text style={st.prodPrice}>from €{p.price} ›</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
          {busy && <Text style={st.typing}>Tully is typing…</Text>}
          {msgs.length === 1 && (
            <View style={st.sugg}>
              {suggestions.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={st.chip}>
                  <Text style={st.chipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
        <View style={st.inputRow}>
          <TextInput style={st.input} placeholder="Type a message" placeholderTextColor={colors.muted} value={text} onChangeText={setText} onSubmitEditing={() => send(text)} returnKeyType="send" maxLength={300} />
          <Pressable onPress={() => send(text)} style={st.send} accessibilityLabel="Send">
            <Text style={{ color: '#fff', fontFamily: fonts.bold }}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, gap: 10, maxWidth: 720, width: '100%', alignSelf: 'center' },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  bot: { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
  me: { backgroundColor: colors.sage, borderBottomRightRadius: 4 },
  text: { fontFamily: fonts.body, color: colors.deep, fontSize: 15, lineHeight: 21 },
  prod: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.sageLight, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14 },
  prodName: { fontFamily: fonts.bold, color: colors.deep, fontSize: 13 },
  prodPrice: { fontFamily: fonts.bold, color: colors.clay, fontSize: 13 },
  typing: { fontFamily: fonts.body, color: colors.muted, fontSize: 13 },
  sugg: { gap: 8, marginTop: 6, alignItems: 'flex-start' },
  chip: { backgroundColor: colors.sageLight, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14 },
  chipText: { fontFamily: fonts.bold, color: colors.deep, fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.line },
  input: { flex: 1, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10, fontFamily: fonts.body, fontSize: 15, color: colors.deep, borderWidth: 1, borderColor: colors.line },
  send: { backgroundColor: colors.deep, borderRadius: radius.pill, paddingHorizontal: 18, justifyContent: 'center' },
});
