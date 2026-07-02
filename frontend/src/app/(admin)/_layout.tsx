import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView, Modal, SafeAreaView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { notificationService, Notification } from '@/services/notificationService';

const NotificationBell = ({ colors, router }: { colors: any, router: any }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.log('Error fetching notifications:', err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); // Optimistic update
    try {
      await notificationService.markAllAsRead();
    } catch (err) {}
  };

  const handleClearAll = async () => {
    setNotifications([]); // Optimistic update
    try {
      await notificationService.clearAllNotifications();
      setShowDropdown(false);
    } catch (err) {}
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      // Optimistic update for instant feedback
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      
      // Background sync
      notificationService.markAsRead(notif._id).catch(err => console.log(err));
    }
    setShowDropdown(false);

    if (notif.resourceType === 'Order') router.push(`/(admin)/orders/${notif.relatedId}`);
    else if (notif.resourceType === 'Ticket') router.push(`/(admin)/tickets/${notif.relatedId}`);
    else if (notif.resourceType === 'Product') router.push(`/(admin)/products`);
    else if (notif.resourceType === 'User') router.push(`/(admin)/users`);
    else if (notif.resourceType === 'Coupon') router.push(`/(admin)/coupons`);
    else if (notif.resourceType === 'Campaign') router.push(`/(admin)/campaigns`);
    else if (notif.resourceType === 'Banner') router.push(`/(admin)/banners`);
  };

  return (
    <View style={{ position: 'relative', zIndex: 9999 }}>
      <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)} style={{ marginRight: 20 }}>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {showDropdown && (
        <View style={[styles.notificationDropdown, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={[styles.notifHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.notifTitle, { color: colors.text }]}>Notifications</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={{ color: colors.primary, fontSize: 12 }}>Mark all read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={{ color: '#E74C3C', fontSize: 12 }}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            {notifications.length === 0 ? (
              <Text style={{ color: colors.textSecondary, padding: 16, textAlign: 'center' }}>No notifications.</Text>
            ) : (
              notifications.map(notif => (
                <TouchableOpacity 
                  key={notif._id} 
                  style={[styles.notifItem, !notif.isRead && { backgroundColor: colors.primary + '11' }, { borderBottomColor: colors.border }]}
                  onPress={() => handleNotificationClick(notif)}
                >
                  <Text style={[styles.notifItemTitle, { color: colors.text }]} numberOfLines={1}>{notif.title}</Text>
                  <Text style={[styles.notifItemMessage, { color: colors.textSecondary }]} numberOfLines={2}>{notif.message}</Text>
                  <Text style={{ color: colors.primary, fontSize: 10, marginTop: 4 }}>
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default function AdminLayout() {
  const { scheme, toggleTheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = width >= 768;

  React.useEffect(() => {
    if (user && user.role?.toUpperCase() !== 'ADMIN') {
      router.replace('/');
    }
  }, [user]);

  if (!user || user.role?.toUpperCase() !== 'ADMIN') return null;

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
        <TouchableOpacity style={[styles.logoutButton, { marginBottom: 20 }]} onPress={() => {
          router.replace('/');
          if (!isDesktop) setMobileMenuOpen(false);
        }}>
          <Ionicons name="home-outline" size={20} color={colors.primary} />
          <Text style={[styles.sidebarItemText, { color: colors.primary }]}>Go to App Home</Text>
        </TouchableOpacity>
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
            <NotificationBell colors={colors} router={router} />
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
    zIndex: 999, // Ensure dropdown renders above page content
    elevation: 999, // For Android
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
    zIndex: 999,
    elevation: 999,
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
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 320,
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  notifTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  notifItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  notifItemTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  notifItemMessage: {
    fontSize: 12,
  }
});
