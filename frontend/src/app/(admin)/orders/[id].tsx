import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { orderService, Order } from '@/services/orderService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(id as string);
      setOrder(data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to fetch order details', [
        { text: 'Go Back', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      let paymentStatus = order?.paymentStatus;
      if (newStatus === 'Delivered') paymentStatus = 'Paid';
      if (newStatus === 'Cancelled') paymentStatus = 'Refunded'; // Or Failed, etc.

      const updated = await orderService.updateOrderStatus(id as string, newStatus, paymentStatus);
      setOrder(updated);
      Alert.alert('Success', `Order marked as ${newStatus}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      
      {/* Header Info */}
      <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Order #{order._id}</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{order.userName}</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{order.email}</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{order.phone}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Shipping Address</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{order.address}</Text>
          </View>
        </View>
      </View>

      {/* Payment & Status Info */}
      <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Payment & Status</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Method</Text>
            <Text style={[styles.detailValue, { color: colors.text, fontWeight: 'bold' }]}>{order.paymentMethod}</Text>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, marginTop: 8 }]}>Payment Status</Text>
            <Text style={[styles.detailValue, { color: colors.text, fontWeight: 'bold' }]}>{order.paymentStatus}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Current Order Status</Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: 'bold', fontSize: 18 }]}>{order.status}</Text>
          </View>
        </View>

        <Text style={[styles.detailLabel, { color: colors.textSecondary, marginTop: 16, marginBottom: 8 }]}>Update Status To:</Text>
        <View style={styles.statusButtonsContainer}>
          {statusOptions.map(s => (
            <TouchableOpacity 
              key={s} 
              style={[
                styles.statusBtn, 
                { backgroundColor: order.status === s ? colors.primary : colors.background },
                order.status !== s && { borderWidth: 1, borderColor: colors.border }
              ]}
              onPress={() => handleStatusUpdate(s)}
              disabled={updating || order.status === s}
            >
              <Text style={{ color: order.status === s ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {updating && <ActivityIndicator style={{ marginTop: 12 }} color={colors.primary} />}
      </View>

      {/* Items */}
      <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 16 }]}>Order Items</Text>
        {order.items.map((item, idx) => (
          <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border }, idx === order.items.length - 1 && { borderBottomWidth: 0 }]}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/50' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.itemQty, { color: colors.textSecondary }]}>Qty: {item.qty}</Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.text }]}>₹{item.price * item.qty}</Text>
          </View>
        ))}
        
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>₹{order.total}</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  dateText: { fontSize: 14 },
  detailsRow: {
    flexDirection: 'row',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: { fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  detailValue: { fontSize: 15, marginBottom: 4, lineHeight: 22 },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '500' },
  itemQty: { fontSize: 13, marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 24, fontWeight: 'bold' },
});
