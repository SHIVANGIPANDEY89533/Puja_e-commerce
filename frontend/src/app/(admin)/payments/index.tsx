import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { paymentService } from '@/services/paymentService';

export default function AdminPaymentsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, statsData] = await Promise.all([
        paymentService.getAdminPayments(),
        paymentService.getPaymentStats()
      ]);
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load payment data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = payments;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
        (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(q)) ||
        (p.customerName && p.customerName.toLowerCase().includes(q))
      );
    }
    if (filterStatus !== 'All') {
      result = result.filter(p => p.paymentStatus === filterStatus);
    }
    setFilteredPayments(result);
  }, [searchQuery, filterStatus, payments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return '#4CAF50';
      case 'Collected': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Failed': return '#F44336';
      case 'Refunded': return '#9C27B0';
      default: return colors.textSecondary;
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payments Management</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Dashboard Cards */}
        {stats && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>₹{stats.totalRevenue}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today's Revenue</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>₹{stats.todayRevenue}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Transactions</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTransactions}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Success</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.successful}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending / COD</Text>
              <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.pending}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Failed</Text>
              <Text style={[styles.statValue, { color: '#F44336' }]}>{stats.failed}</Text>
            </View>
          </ScrollView>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by TXN ID or Name..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            {['All', 'Success', 'Pending', 'Failed', 'Collected', 'Refunded'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilterBtn,
                  { backgroundColor: filterStatus === status ? colors.primary : colors.backgroundElement, borderColor: colors.border }
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text style={{ color: filterStatus === status ? '#fff' : colors.text }}>{status}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payments Table */}
        <View style={[styles.tableContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.th, { color: colors.textSecondary, flex: 2 }]}>Transaction ID</Text>
            <Text style={[styles.th, { color: colors.textSecondary, flex: 2 }]}>Customer</Text>
            <Text style={[styles.th, { color: colors.textSecondary, flex: 1 }]}>Method</Text>
            <Text style={[styles.th, { color: colors.textSecondary, flex: 1.5 }]}>Amount</Text>
            <Text style={[styles.th, { color: colors.textSecondary, flex: 1 }]}>Status</Text>
            <Text style={[styles.th, { color: colors.textSecondary, flex: 0.5, textAlign: 'center' }]}>Act</Text>
          </View>

          {filteredPayments.map(payment => (
            <View key={payment._id} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.td, { color: colors.text, fontWeight: 'bold' }]}>
                  {payment.transactionId}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {new Date(payment.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.td, { color: colors.text, flex: 2 }]}>{payment.customerName}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.td, { color: colors.text }]}>{payment.paymentGateway}</Text>
              </View>
              <Text style={[styles.td, { color: colors.text, flex: 1.5, fontWeight: 'bold' }]}>₹{payment.amount}</Text>
              <View style={{ flex: 1 }}>
                <View style={[styles.badge, { backgroundColor: getStatusColor(payment.paymentStatus) + '20' }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(payment.paymentStatus) }]}>
                    {payment.paymentStatus}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{ flex: 0.5, alignItems: 'center' }}
                onPress={() => router.push(`/(admin)/payments/${payment._id}`)}
              >
                <Ionicons name="eye-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}

          {filteredPayments.length === 0 && (
            <Text style={{ textAlign: 'center', padding: 24, color: colors.textSecondary }}>No payments found.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    minWidth: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusFilterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  th: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  td: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
