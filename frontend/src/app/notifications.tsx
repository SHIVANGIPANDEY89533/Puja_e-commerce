import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { notificationService, Notification } from '@/services/notificationService';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NotificationsScreen() {
  const router = useRouter();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (item: Notification) => {
    try {
      if (!item.isRead) {
        await notificationService.markAsRead(item._id);
        setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, isRead: true } : n));
      }
      
      if (item.resourceType === 'Ticket' && item.relatedId) {
        router.push(`/support/${item.relatedId}`);
      } else if (item.resourceType === 'Order' && item.relatedId) {
        router.push(`/my-orders/${item.relatedId}`);
      } else if (item.resourceType === 'Product' && item.relatedId) {
        router.push(`/product/${item.relatedId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: item.isRead ? colors.background : colors.backgroundElement, 
          borderColor: item.isRead ? colors.border : colors.primary + '50'
        }
      ]}
      onPress={() => markAsRead(item)}
    >
      <View style={[styles.iconBox, { backgroundColor: item.isRead ? colors.border : colors.primary + '20' }]}>
        <Ionicons name="notifications" size={20} color={item.isRead ? colors.textSecondary : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.message, { color: colors.text, fontWeight: item.isRead ? 'normal' : 'bold' }]}>
          {item.message}
        </Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
    </TouchableOpacity>
  );

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Ionicons name="checkmark-done-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            refreshing={loading}
            onRefresh={fetchNotifications}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center'
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  message: { fontSize: 14, marginBottom: 4 },
  time: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, marginTop: 16, textAlign: 'center' }
});
