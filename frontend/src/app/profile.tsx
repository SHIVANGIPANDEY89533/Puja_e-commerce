import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundElement }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: user?.role?.toUpperCase() === 'ADMIN' ? '#E74C3C' : colors.primary }]}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/my-orders')}
          >
            <Ionicons name="cart" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>My Orders</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/addresses')}
          >
            <Ionicons name="location" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/coupons')}
          >
            <Ionicons name="pricetag" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>My Coupons</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/user-settings')}
          >
            <Ionicons name="settings" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/support')}
          >
            <Ionicons name="help-buoy" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {user?.role === 'ADMIN' && (
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push('/(admin)/dashboard')}
            >
              <Ionicons name="shield" size={24} color="#E74C3C" />
              <Text style={[styles.menuText, { color: '#E74C3C', fontWeight: 'bold' }]}>Admin Dashboard</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: 'transparent' }]} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="red" />
            <Text style={[styles.menuText, { color: 'red' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
  },
});
