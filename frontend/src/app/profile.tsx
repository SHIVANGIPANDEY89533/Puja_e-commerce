import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useRouter, Link } from 'expo-router';
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

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <ProtectedRoute>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        
        {/* Cover Photo Area */}
        <View style={[styles.coverPhoto, { backgroundColor: colors.primary + '15' }]}>
          {/* Subtle pattern or graphic could go here */}
          <Ionicons name="sparkles" size={100} color={colors.primary + '10'} style={{ position: 'absolute', right: -20, top: -20 }} />
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileInfoContainer}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.background, borderColor: colors.background }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
          
          {user?.role?.toUpperCase() === 'ADMIN' && (
            <View style={[styles.roleBadge, { backgroundColor: '#E74C3C' }]}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.roleText}>ADMIN</Text>
            </View>
          )}
        </View>

        {/* Menu Sections */}
        <View style={styles.sectionsContainer}>
          
          {/* Shopping Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>My Shopping</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Link href="/my-orders" asChild>
              <TouchableOpacity style={StyleSheet.flatten([styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }])}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="cube" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>My Orders</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.chevron} />
              </TouchableOpacity>
            </Link>

            <Link href="/addresses" asChild>
              <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.iconWrapper, { backgroundColor: '#2ECC71' + '15' }]}>
                  <Ionicons name="location" size={20} color="#2ECC71" />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>Saved Addresses</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.chevron} />
              </TouchableOpacity>
            </Link>
          </View>

          {/* Preferences Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences & Help</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Link href="/user-settings" asChild>
              <TouchableOpacity style={StyleSheet.flatten([styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }])}>
                <View style={[styles.iconWrapper, { backgroundColor: '#9B59B6' + '15' }]}>
                  <Ionicons name="options" size={20} color="#9B59B6" />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>Account Settings</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.chevron} />
              </TouchableOpacity>
            </Link>

            <Link href="/support" asChild>
              <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.iconWrapper, { backgroundColor: '#F1C40F' + '15' }]}>
                  <Ionicons name="headset" size={20} color="#F39C12" />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.chevron} />
              </TouchableOpacity>
            </Link>
          </View>

          {/* Admin Section */}
          {user?.role === 'ADMIN' && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionTitle, { color: '#E74C3C' }]}>Administration</Text>
              <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: '#E74C3C' + '30' }]}>
                <Link href="/(admin)/dashboard" asChild>
                  <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#E74C3C' + '15' }]}>
                      <Ionicons name="pie-chart" size={20} color="#E74C3C" />
                    </View>
                    <Text style={[styles.menuText, { color: colors.text, fontWeight: 'bold' }]}>Admin Dashboard</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.chevron} />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}

          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.backgroundElement, borderColor: '#E74C3C' + '50' }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#E74C3C" />
            <Text style={[styles.logoutText, { color: '#E74C3C' }]}>Log Out</Text>
          </TouchableOpacity>
          
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>App Version 1.0.0</Text>
        </View>

      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverPhoto: {
    height: 140,
    width: '100%',
    overflow: 'hidden',
  },
  profileInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    }),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 15,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 8,
    marginTop: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  }
});
