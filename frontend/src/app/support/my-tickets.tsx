import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ticketService, Ticket } from '@/services/ticketService';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyTicketsScreen() {
  const router = useRouter();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getMyTickets();
      setTickets(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

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

  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      onPress={() => router.push(`/support/${item._id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.subject, { color: colors.text }]} numberOfLines={1}>{item.subject}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
          <Text style={{ color: getStatusColor(item.status), fontSize: 11, fontWeight: 'bold' }}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category} • {item.priority} Priority</Text>
      
      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>ID: #{item._id.substring(0, 8)}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Tickets</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You don't have any support tickets.</Text>
            <TouchableOpacity 
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/support/create')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            refreshing={loading}
            onRefresh={fetchTickets}
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  subject: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  category: { fontSize: 13, marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, marginTop: 16, marginBottom: 24, textAlign: 'center' },
  createBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }
});
