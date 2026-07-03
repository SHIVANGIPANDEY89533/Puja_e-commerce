import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform, Image, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { bannerService, Banner } from '@/services/bannerService';
import { Ionicons } from '@expo/vector-icons';

export default function BannerManagementScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [displayPosition, setDisplayPosition] = useState<'Home' | 'Category' | 'Product' | 'Global'>('Home');
  const [priority, setPriority] = useState('0');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setImage('');
    setRedirectUrl('');
    setDisplayPosition('Home');
    setPriority('0');
    setStatus('Active');
    setModalVisible(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setImage(b.image);
    setRedirectUrl(b.redirectUrl || '');
    setDisplayPosition(b.displayPosition);
    setPriority(b.priority.toString());
    setStatus(b.status);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !image.trim()) return alert('Title and Image URL are required');
    setIsSubmitting(true);
    
    try {
      const payload = { 
        title, 
        image, 
        redirectUrl, 
        displayPosition, 
        priority: parseInt(priority, 10) || 0,
        status 
      };
      
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner._id, payload);
      } else {
        await bannerService.createBanner(payload);
      }
      
      setModalVisible(false);
      fetchBanners();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    const remove = async () => {
      try {
        await bannerService.deleteBanner(id);
        fetchBanners();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete banner "${titleStr}"?`)) remove();
    } else {
      Alert.alert('Confirm', `Delete banner "${titleStr}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: remove }
      ]);
    }
  };

  const renderItem = ({ item }: { item: Banner }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
      
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: item.status === 'Active' ? '#2ECC7122' : '#E74C3C22' }]}>
            <Text style={[styles.badgeText, { color: item.status === 'Active' ? '#27AE60' : '#C0392B' }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>Position: <Text style={{fontWeight:'bold', color: colors.text}}>{item.displayPosition}</Text></Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>Priority: <Text style={{fontWeight:'bold', color: colors.text}}>{item.priority}</Text></Text>
        </View>
        <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>URL: {item.redirectUrl || 'N/A'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.title)}>
          <Ionicons name="trash" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Banner Management</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Banner</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={banners}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingBanner ? 'Edit Banner' : 'Add Banner'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Banner Title *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Diwali Sale"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Image URL *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={image}
                onChangeText={setImage}
                placeholder="https://example.com/banner.jpg"
                placeholderTextColor={colors.textSecondary}
              />
              {image ? (
                <Image source={{ uri: image }} style={{ width: '100%', height: 120, borderRadius: 8, marginTop: 8 }} resizeMode="cover" />
              ) : null}

              <Text style={[styles.label, { color: colors.textSecondary }]}>Redirect URL (Optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={redirectUrl}
                onChangeText={setRedirectUrl}
                placeholder="/category/festival"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Display Position</Text>
                  <View style={styles.selectGroup}>
                    {(['Home', 'Category', 'Product'] as const).map((pos) => (
                      <TouchableOpacity 
                        key={pos}
                        style={[styles.selectPill, { backgroundColor: displayPosition === pos ? colors.primary : 'transparent', borderColor: colors.border }]} 
                        onPress={() => setDisplayPosition(pos)}
                      >
                        <Text style={{ color: displayPosition === pos ? '#fff' : colors.text, fontSize: 12 }}>{pos}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ width: 100, paddingLeft: 8 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    value={priority}
                    onChangeText={setPriority}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
              <View style={styles.statusGroup}>
                <TouchableOpacity 
                  style={[styles.statusPill, { backgroundColor: status === 'Active' ? colors.primary : 'transparent', borderColor: colors.border }]} 
                  onPress={() => setStatus('Active')}
                >
                  <Text style={{ color: status === 'Active' ? '#fff' : colors.text }}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusPill, { backgroundColor: status === 'Inactive' ? colors.primary : 'transparent', borderColor: colors.border }]} 
                  onPress={() => setStatus('Inactive')}
                >
                  <Text style={{ color: status === 'Inactive' ? '#fff' : colors.text }}>Inactive</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]} 
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Banner</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  
  card: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  bannerImage: { width: '100%', height: 140, borderRadius: 8, marginBottom: 12 },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  metaText: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { width: '100%', maxWidth: 600, borderRadius: 16, maxHeight: '90%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  formScroll: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  row: { flexDirection: 'row' },
  selectGroup: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  selectPill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  statusGroup: { flexDirection: 'row', gap: 12 },
  statusPill: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  btn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
