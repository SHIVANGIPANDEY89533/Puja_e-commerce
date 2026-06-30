import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { orderService, Order } from '@/services/orderService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function OrderDetailsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id as string);
      setOrder(data);
    } catch (error) {
      console.log('Failed to load order details', error);
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

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Order Not Found</Text>
        <TouchableOpacity 
          style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primary, borderRadius: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
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
          <Text style={[styles.title, { color: colors.text }]}>Order Details</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.orderId, { color: colors.text }]}>Order #{order._id.substring(0, 8).toUpperCase()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
              </View>
            </View>
            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.backgroundElement, marginTop: 8 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order.userName}</Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order.address}</Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>Phone: {order.phone}</Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.backgroundElement, marginTop: 8 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Information</Text>
            <View style={styles.paymentRow}>
              <Text style={{ color: colors.textSecondary }}>Method</Text>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={{ color: colors.textSecondary }}>Status</Text>
              <Text style={{ color: order.paymentStatus === 'Paid' ? '#4CAF50' : colors.primary, fontWeight: 'bold' }}>
                {order.paymentStatus}
              </Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.backgroundElement, marginTop: 8, marginBottom: 24 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Items in Order</Text>
            {order.items.map((item, index) => (
              <View key={index} style={[styles.itemRow, { borderBottomColor: index === order.items.length - 1 ? 'transparent' : colors.border }]}>
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                  <Text style={[styles.itemQty, { color: colors.textSecondary }]}>Qty: {item.qty}</Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.text }]}>₹{item.price * item.qty}</Text>
              </View>
            ))}
            
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>₹{order.total}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginRight: 8, marginLeft: -8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  orderDate: { fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  addressText: { fontSize: 14, marginBottom: 4, lineHeight: 20 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  itemImagePlaceholder: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  itemQty: { fontSize: 12 },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, marginTop: 4, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' }
});
