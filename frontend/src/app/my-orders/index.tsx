import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { orderService, Order } from '@/services/orderService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyOrdersScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#4CAF50';
      case 'shipped': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>No Orders Yet</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>Looks like you haven't placed an order.</Text>
            <TouchableOpacity 
              style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primary, borderRadius: 8 }}
              onPress={() => router.replace('/')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.orderCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                onPress={() => router.push(`/my-orders/${item._id}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={[styles.orderId, { color: colors.text }]}>Order #{item._id.substring(0, 8).toUpperCase()}</Text>
                  <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                    {item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}
                  </Text>
                  <Text style={[styles.orderTotal, { color: colors.text }]}>
                    ₹{item.total}
                  </Text>
                </View>

                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderDate: {
    fontSize: 14,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCount: {
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
