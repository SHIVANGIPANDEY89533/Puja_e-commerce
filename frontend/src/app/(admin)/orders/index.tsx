import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { orderService, Order } from '@/services/orderService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OrderListScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setError('');
      const data = await orderService.getOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); 

  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let result = orders;
    
    // Apply search filter
    if (search.trim() !== '') {
      const lower = search.toLowerCase();
      result = result.filter(o => 
        o._id.toLowerCase().includes(lower) || 
        o.userName.toLowerCase().includes(lower) || 
        o.status.toLowerCase().includes(lower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [search, statusFilter, orders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': 
      case 'placed': return { bg: '#FDEBD0', text: '#D35400' };
      case 'confirmed': return { bg: '#FCF3CF', text: '#F1C40F' };
      case 'packed': 
      case 'processing': return { bg: '#D6EAF8', text: '#2980B9' };
      case 'shipped': 
      case 'dispatched': return { bg: '#D4E6F1', text: '#2471A3' };
      case 'out for delivery': return { bg: '#D1F2EB', text: '#16A085' };
      case 'delivered': return { bg: '#D5F5E3', text: '#27AE60' };
      case 'cancelled': return { bg: '#FADBD8', text: '#C0392B' };
      case 'returned': return { bg: '#EBDEF0', text: '#8E44AD' };
      default: return { bg: '#EBEDEF', text: '#7F8C8D' };
    }
  };

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
      <Text style={[styles.tableHeaderText, { flex: 1.5, color: colors.textSecondary }]}>Order ID</Text>
      <Text style={[styles.tableHeaderText, { flex: 1.5, color: colors.textSecondary }]}>Customer</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Date</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Total</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Status</Text>
      <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center', color: colors.textSecondary }]}>Actions</Text>
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.tableCell, { flex: 1.5, color: colors.text, fontWeight: '500' }]} numberOfLines={1}>{item._id}</Text>
        <Text style={[styles.tableCell, { flex: 1.5, color: colors.textSecondary }]} numberOfLines={1}>{item.userName}</Text>
        <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={[styles.tableCell, { flex: 1, color: colors.text, fontWeight: '600' }]}>₹{item.total}</Text>
        
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => router.push(`/(admin)/orders/${item._id}`)}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.toolbar, { backgroundColor: colors.background }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
            placeholder="Search by ID, Name, or Status..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.border }]} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={colors.text} />
          <Text style={[styles.addButtonText, { color: colors.text }]}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusOptions.map(s => (
            <TouchableOpacity 
              key={s} 
              style={[
                styles.filterPill, 
                { backgroundColor: statusFilter === s ? colors.primary : colors.backgroundElement, borderColor: colors.border }
              ]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={{ color: statusFilter === s ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.tableContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 800 }}>
            {renderTableHeader()}
            
            {loading && !orders.length ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40, paddingBottom: 40 }}>
                    {error ? error : 'No orders found.'}
                  </Text>
                }
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 250,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: { fontWeight: 'bold', marginLeft: 8 },
  
  filterRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },

  // Table Styles
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 14,
    paddingRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: { 
    width: 80, 
    flexDirection: 'row', 
    justifyContent: 'center',
  },
  actionButton: { 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
