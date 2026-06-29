import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ticketService, Ticket } from '@/services/ticketService';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminTicketsScreen() {
  const router = useRouter();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      
      const data = await ticketService.getAllTickets(filters);
      setTickets(data);
    } catch (err) {
      alert('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t._id.includes(searchQuery) || 
    t.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return '#3498DB';
      case 'In Progress': return '#F39C12';
      case 'Waiting for Customer': return '#E67E22';
      case 'Resolved': return '#2ECC71';
      case 'Closed': return '#7F8C8D';
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent': return '#C0392B';
      case 'High': return '#E74C3C';
      case 'Medium': return '#F39C12';
      case 'Low': return '#3498DB';
      default: return colors.textSecondary;
    }
  };

  const FilterBadge = ({ label, value, current, setter }: any) => (
    <TouchableOpacity 
      style={[
        styles.filterBadge, 
        { 
          backgroundColor: current === value ? colors.primary : colors.backgroundElement,
          borderColor: current === value ? colors.primary : colors.border
        }
      ]}
      onPress={() => setter(current === value ? '' : value)}
    >
      <Text style={{ color: current === value ? '#fff' : colors.text, fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      onPress={() => router.push(`/(admin)/tickets/${item._id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.subject, { color: colors.text }]} numberOfLines={1}>{item.subject}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
          <Text style={{ color: getStatusColor(item.status), fontSize: 11, fontWeight: 'bold' }}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
          <Ionicons name="person" size={12} /> {item.user?.name} ({item.user?.email})
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
        <View style={[styles.priorityBadge, { borderColor: getPriorityColor(item.priority) }]}>
          <Text style={{ color: getPriorityColor(item.priority), fontSize: 10, fontWeight: 'bold' }}>{item.priority}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>ID: #{item._id.substring(0, 8)}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ProtectedRoute adminOnly>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Support Tickets</Text>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by ID, Subject or Email..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <FilterBadge label="Open" value="Open" current={filterStatus} setter={setFilterStatus} />
            <FilterBadge label="In Progress" value="In Progress" current={filterStatus} setter={setFilterStatus} />
            <FilterBadge label="Waiting for Customer" value="Waiting for Customer" current={filterStatus} setter={setFilterStatus} />
            <FilterBadge label="Resolved" value="Resolved" current={filterStatus} setter={setFilterStatus} />
            <FilterBadge label="Closed" value="Closed" current={filterStatus} setter={setFilterStatus} />
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredTickets}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="ticket-outline" size={64} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tickets found.</Text>
              </View>
            }
          />
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterLabel: { fontSize: 13, marginRight: 8, fontWeight: '600' },
  filterScroll: { flexDirection: 'row' },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  subject: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  customerInfo: { fontSize: 13 },
  category: { fontSize: 13, marginRight: 12 },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, marginTop: 16 }
});
