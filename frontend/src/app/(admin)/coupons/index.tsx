import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Platform, Modal, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

export default function CouponsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState('Percentage');
  const [minCart, setMinCart] = useState('0');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch (err) {
      alert('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = async () => {
    if (!code || !discount) return alert('Code and discount are required');
    setSaving(true);
    try {
      await api.post('/coupons', {
        code,
        discount: Number(discount),
        type,
        minCart: Number(minCart)
      });
      setModalVisible(false);
      resetForm();
      fetchCoupons();
      alert('Coupon created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (couponCode: string) => {
    try {
      await api.put(`/coupons/${couponCode}/toggle`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDelete = (couponCode: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete coupon ${couponCode}?`)) {
        deleteCoupon(couponCode);
      }
    } else {
      Alert.alert('Delete Coupon', `Are you sure you want to delete ${couponCode}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCoupon(couponCode) }
      ]);
    }
  };

  const deleteCoupon = async (couponCode: string) => {
    try {
      await api.delete(`/coupons/${couponCode}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscount('');
    setType('Percentage');
    setMinCart('0');
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.code, { color: colors.text }]}>{item.code}</Text>
        <TouchableOpacity 
          style={[styles.statusBadge, { backgroundColor: item.active ? '#2ECC7122' : '#E74C3C22' }]}
          onPress={() => toggleStatus(item.code)}
        >
          <Text style={{ color: item.active ? '#2ECC71' : '#E74C3C', fontSize: 12, fontWeight: 'bold' }}>
            {item.active ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsRow}>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Discount</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {item.type === 'Percentage' ? `${item.discount}%` : `₹${item.discount}`}
          </Text>
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Min. Cart</Text>
          <Text style={[styles.value, { color: colors.text }]}>₹{item.minCart}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.code)}>
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ProtectedRoute adminOnly>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Coupons</Text>
          <TouchableOpacity 
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 4 }}>Add Coupon</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search coupons..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredCoupons}
            keyExtractor={item => item.code}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="pricetag-outline" size={64} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No coupons found.</Text>
              </View>
            }
          />
        )}

        {/* Create Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create Coupon</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Coupon Code (e.g. DIWALI50)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={code} onChangeText={setCode} autoCapitalize="characters" />
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Discount Value</Text>
                  <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={discount} onChangeText={setDiscount} keyboardType="numeric" />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Type (Percentage / Flat)</Text>
                  <TouchableOpacity 
                    style={[styles.input, { borderColor: colors.border, justifyContent: 'center' }]}
                    onPress={() => setType(type === 'Percentage' ? 'Flat' : 'Percentage')}
                  >
                    <Text style={{ color: colors.text }}>{type}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Minimum Cart Value (₹)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={minCart} onChangeText={setMinCart} keyboardType="numeric" />
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  code: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 'bold' },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8, marginLeft: 8 },
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
