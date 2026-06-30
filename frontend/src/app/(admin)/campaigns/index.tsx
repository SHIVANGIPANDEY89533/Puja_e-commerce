import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Platform, Modal, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

export default function CampaignsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Email');
  const [status, setStatus] = useState('Scheduled');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      alert('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = async () => {
    if (!name || !startDate || !endDate) return alert('Name, Start Date, and End Date are required');
    setSaving(true);
    try {
      await api.post('/campaigns', {
        name,
        type,
        status,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
      setModalVisible(false);
      resetForm();
      fetchCampaigns();
      alert('Campaign created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/campaigns/${id}/status`, { status: newStatus });
      fetchCampaigns();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this campaign?')) {
        deleteCampaign(id);
      }
    } else {
      Alert.alert('Delete Campaign', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCampaign(id) }
      ]);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await api.delete(`/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      alert('Failed to delete campaign');
    }
  };

  const resetForm = () => {
    setName('');
    setType('Email');
    setStatus('Scheduled');
    setStartDate('');
    setEndDate('');
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.campaignName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.type}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === 'Running' ? '#2ECC7122' : item.status === 'Completed' ? '#3498DB22' : '#F39C1222' 
          }]}>
            <Text style={{ 
              color: item.status === 'Running' ? '#2ECC71' : item.status === 'Completed' ? '#3498DB' : '#F39C12', 
              fontSize: 12, fontWeight: 'bold' 
            }}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Start Date</Text>
          <Text style={[styles.value, { color: colors.text }]}>{new Date(item.startDate).toLocaleDateString()}</Text>
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>End Date</Text>
          <Text style={[styles.value, { color: colors.text }]}>{new Date(item.endDate).toLocaleDateString()}</Text>
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Sent</Text>
          <Text style={[styles.value, { color: colors.text }]}>{item.sent}</Text>
        </View>
      </View>
      
      <View style={styles.footerActions}>
        {item.status !== 'Running' && item.status !== 'Completed' && (
          <TouchableOpacity onPress={() => updateStatus(item._id, 'Running')}>
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13 }}>START CAMPAIGN</Text>
          </TouchableOpacity>
        )}
        {item.status === 'Running' && (
          <TouchableOpacity onPress={() => updateStatus(item._id, 'Completed')}>
            <Text style={{ color: '#E74C3C', fontWeight: 'bold', fontSize: 13 }}>END CAMPAIGN</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ProtectedRoute adminOnly>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Marketing Campaigns</Text>
          <TouchableOpacity 
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 4 }}>Add Campaign</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search campaigns..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredCampaigns}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="megaphone-outline" size={64} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No campaigns found.</Text>
              </View>
            }
          />
        )}

        {/* Create Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create Campaign</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Campaign Name</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={name} onChangeText={setName} placeholder="e.g. Diwali Mega Sale" placeholderTextColor={colors.textSecondary} />
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Type</Text>
                  <TouchableOpacity 
                    style={[styles.input, { borderColor: colors.border, justifyContent: 'center' }]}
                    onPress={() => setType(type === 'Email' ? 'Push Notification' : type === 'Push Notification' ? 'SMS' : 'Email')}
                  >
                    <Text style={{ color: colors.text }}>{type}</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Initial Status</Text>
                  <TouchableOpacity 
                    style={[styles.input, { borderColor: colors.border, justifyContent: 'center' }]}
                    onPress={() => setStatus(status === 'Scheduled' ? 'Running' : 'Scheduled')}
                  >
                    <Text style={{ color: colors.text }}>{status}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Start Date (YYYY-MM-DD)</Text>
                  <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={startDate} onChangeText={setStartDate} placeholder="2026-10-15" placeholderTextColor={colors.textSecondary} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>End Date (YYYY-MM-DD)</Text>
                  <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={endDate} onChangeText={setEndDate} placeholder="2026-10-25" placeholderTextColor={colors.textSecondary} />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
                onPress={handleCreate}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  createBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 16, height: 48, borderRadius: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  campaignName: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 14, fontWeight: '500' },
  footerActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 12 },
  actionBtn: { padding: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 500, padding: 24, borderRadius: 16, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, height: 44, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  saveBtn: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 }
});
