import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';

import { colors, fonts } from './src/theme';
import { Order, StoreProvider, useStore } from './src/store';
import { clearPending, loadPending } from './src/payment';
import { getSession } from './src/api';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import ChatScreen from './src/screens/ChatScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import SuccessScreen from './src/screens/SuccessScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ['home', 'home-outline'],
  Shop: ['leaf', 'leaf-outline'],
  Chat: ['chatbubble-ellipses', 'chatbubble-ellipses-outline'],
  Orders: ['receipt', 'receipt-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.deep,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={icons[route.name][focused ? 0 : 1]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
    </Tab.Navigator>
  );
}

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.deep, card: colors.bg, text: colors.deep, border: colors.line } };

// On web, Stripe sends the customer back to "/?paid=<session id>". Here we check the payment and save the order.
function useStripeReturn(onPaid: (order: Order) => void) {
  return async () => {
    if (Platform.OS !== 'web') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('paid');
    if (!params.has('paid') && !params.has('canceled')) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (!sessionId) return;
    const pending = await loadPending();
    if (!pending || pending.sessionId !== sessionId) return;
    try {
      const { paid } = await getSession(sessionId);
      if (paid) onPaid(pending.order);
    } catch {}
    await clearPending();
  };
}

function Root() {
  const { addOrder, clearCart } = useStore();
  const navRef = useNavigationContainerRef<any>();
  const handleReturn = useStripeReturn((order) => {
    addOrder(order);
    clearCart();
    navRef.reset({ index: 1, routes: [{ name: 'Tabs', params: { screen: 'Orders' } }, { name: 'Success', params: { id: order.id } }] });
  });
  const header = { headerStyle: { backgroundColor: colors.bg }, headerTitleStyle: { fontFamily: fonts.title, color: colors.deep }, headerTintColor: colors.deep, headerShadowVisible: false };

  return (
    <NavigationContainer theme={navTheme} ref={navRef} onReady={handleReturn}>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={header}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Product" component={ProductScreen} options={{ title: '' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your cart' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        <Stack.Screen name="Success" component={SuccessScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded] = useFonts({ Fraunces_600SemiBold, DMSans_400Regular, DMSans_700Bold });
  if (!loaded)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.sage} />
      </View>
    );

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
