import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { scheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.content}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={20} color={colors.primary} />
          <View style={styles.textContainer}>
            <Text style={[styles.deliverTo, { color: colors.textSecondary }]}>Deliver to</Text>
            <Text style={[styles.address, { color: colors.text }]} numberOfLines={1}>Mumbai 400001</Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.iconButton}>
            <Ionicons name="cart-outline" size={22} color={colors.text} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Ionicons name={scheme === 'dark' ? "sunny" : "moon"} size={20} color={colors.text} />
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.authButtons}>
              <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginBtn}>
                <Text style={[styles.loginText, { color: colors.text }]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/signup')} style={[styles.signupBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 48, 
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 8,
    marginRight: 4,
  },
  deliverTo: {
    fontSize: 12,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    fontWeight: '700',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    padding: 4,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  loginText: {
    fontWeight: '600',
    fontSize: 13,
  },
  signupBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  signupText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  profileBtn: {
    marginLeft: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -4,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
