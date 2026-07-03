import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider, useCart } from '@/context/CartContext';

function TabNavigator() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const insets = useSafeAreaInsets();

  return (
    <NavThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Tabs
        backBehavior="history"
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.backgroundElement,
            borderTopColor: colors.border,
            height: (Platform.OS === 'android' ? 66 : 60) + insets.bottom,
            paddingBottom: (Platform.OS === 'android' ? 14 : 8) + insets.bottom,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            marginTop: 4,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categories',
            tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Wishlist',
            tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            href: null,
            title: 'Cart',
            tabBarIcon: ({ color }) => (
              <View>
                <Ionicons name="cart" size={24} color={color} />
                {cartCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          }}
        />
        {/* Auth routes */}
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="signup" options={{ href: null }} />
        
        {/* Hidden internal routes */}
        <Tabs.Screen name="my-orders/index" options={{ href: null }} />
        <Tabs.Screen name="product/[id]" options={{ href: null }} />
        <Tabs.Screen name="checkout" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="support/index" options={{ href: null }} />
        <Tabs.Screen name="support/create" options={{ href: null }} />
        <Tabs.Screen name="support/ai-chat" options={{ href: null }} />
        <Tabs.Screen name="support/my-tickets" options={{ href: null }} />
        <Tabs.Screen name="support/[id]" options={{ href: null }} />
        <Tabs.Screen name="my-orders/[id]" options={{ href: null }} />
        <Tabs.Screen name="addresses/index" options={{ href: null }} />
        <Tabs.Screen name="addresses/add" options={{ href: null }} />
        <Tabs.Screen name="coupons/index" options={{ href: null }} />
        <Tabs.Screen name="user-settings/index" options={{ href: null }} />
        <Tabs.Screen name="user-settings/change-password" options={{ href: null }} />
        
        {/* Admin routes (Only visible to admin, and hides tab bar when active) */}
        <Tabs.Screen 
          name="(admin)" 
          options={{ 
            href: isAdmin ? '/(admin)/dashboard' : null,
            title: 'Admin',
            tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark" size={24} color={color} />,
            tabBarStyle: { display: 'none' }
          }} 
        />
      </Tabs>
    </NavThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ThemeProvider>
            <TabNavigator />
          </ThemeProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
