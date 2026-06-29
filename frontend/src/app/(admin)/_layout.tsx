import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView, Modal, SafeAreaView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const { scheme, toggleTheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isDesktop = width >= 768;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/(admin)/dashboard', icon: 'speedometer-outline' as const },
    { name: 'Products', path: '/(admin)/products', icon: 'cube-outline' as const },
    { name: 'Categories', path: '/(admin)/categories', icon: 'grid-outline' as const },
    { name: 'Orders', path: '/(admin)/orders', icon: 'cart-outline' as const },
    { name: 'Users', path: '/(admin)/users', icon: 'people-outline' as const },
    { name: 'Banners', path: '/(admin)/banners', icon: 'image-outline' as const },
    { name: 'Coupons', path: '/(admin)/coupons', icon: 'pricetag-outline' as const },
    { name: 'Campaigns', path: '/(admin)/campaigns', icon: 'megaphone-outline' as const },
    { name: 'Reports', path: '/(admin)/reports', icon: 'bar-chart-outline' as const },
    { name: 'Tickets', path: '/(admin)/tickets', icon: 'ticket-outline' as const },
    { name: 'Settings', path: '/(admin)/settings', icon: 'settings-outline' as const },
  ];

  const handleNavigate = (path: string) => {
    router.push(path as any);
    if (!isDesktop) setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const currentMenu = menuItems.find(m => pathname.startsWith(m.path)) || menuItems[0];

  const SidebarContent = () => (
    <View style={{ flex: 1 }}>
      <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
        <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
        <Text style={[styles.sidebarTitle, { color: colors.text }]}>Admin Panel</Text>
      </View>
      <ScrollView style={styles.sidebarScroll}>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <TouchableOpacity
              key={item.path}
              style={[
                styles.sidebarItem,
                isActive && { backgroundColor: colors.primary + '1A', borderRightWidth: 3, borderRightColor: colors.primary }
              ]}
              onPress={() => handleNavigate(item.path)}
            >
              <Ionicons name={item.icon} size={20} color={isActive ? colors.primary : colors.textSecondary} />
              <Text style={[styles.sidebarItemText, { color: isActive ? colors.primary : colors.text }]}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
          <Text style={[styles.sidebarItemText, { color: '#E74C3C' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <View style={[styles.desktopSidebar, { backgroundColor: colors.backgroundElement, borderRightColor: colors.border }]}>
          <SidebarContent />
        </View>
      )}

      {/* Mobile Sidebar Modal */}
      {!isDesktop && (
        <Modal visible={mobileMenuOpen} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.mobileSidebar, { backgroundColor: colors.backgroundElement }]}>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.mobileCloseContainer}>
                  <TouchableOpacity onPress={() => setMobileMenuOpen(false)}>
                    <Ionicons name="close" size={28} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <SidebarContent />
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      )}

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Top Header */}
        <View style={[styles.topHeader, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            {!isDesktop && (
              <TouchableOpacity onPress={() => setMobileMenuOpen(true)} style={styles.hamburger}>
                <Ionicons name="menu" size={28} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, { color: colors.text }]}>{currentMenu.name}</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 20 }}>
              <Ionicons name={scheme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.profileBadge}>
              <Text style={styles.profileText}>{user?.name?.charAt(0).toUpperCase() || 'A'}</Text>
            </View>
            {isDesktop && <Text style={[styles.profileName, { color: colors.text }]}>{user?.name}</Text>}
          </View>
        </View>

        {/* Dynamic Page Content */}
        <View style={styles.pageContainer}>
          <Slot />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopSidebar: {
    width: 250,
    borderRightWidth: 1,
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mobileSidebar: {
    width: 280,
    height: '100%',
  },
  mobileCloseContainer: {
    padding: 16,
    alignItems: 'flex-end',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sidebarScroll: {
    flex: 1,
    paddingVertical: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  sidebarItemText: {
    fontSize: 15,
    marginLeft: 16,
    fontWeight: '500',
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  topHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburger: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileName: {
    fontWeight: '500',
  },
  pageContainer: {
    flex: 1,
  }
});
