import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform, Image, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { categoryService, Category } from '@/services/categoryService';
import { Ionicons } from '@expo/vector-icons';

export default function CategoryManagementScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [banner, setBanner] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setName('');
    setIcon('');
    setBanner('');
    setDescription('');
    setStatus('Active');
    setModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon || '');
    setBanner(cat.banner || '');
    setDescription(cat.description || '');
    setStatus(cat.status);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Category Name is required');
    setIsSubmitting(true);
    
    try {
      const payload = { name, icon, banner, description, status };
      
      if (editingCat) {
        await categoryService.updateCategory(editingCat._id, payload);
      } else {
        await categoryService.createCategory({ ...payload, displayOrder: categories.length });
      }
      
      setModalVisible(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    const remove = async () => {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete category "${catName}"?`)) remove();
    } else {
      Alert.alert('Confirm', `Delete category "${catName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: remove }
      ]);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newCats = [...categories];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap displayOrders
    const tempOrder = newCats[index].displayOrder;
    newCats[index].displayOrder = newCats[swapIndex].displayOrder;
    newCats[swapIndex].displayOrder = tempOrder;
    
    // Swap array elements for optimistic UI
    const temp = newCats[index];
    newCats[index] = newCats[swapIndex];
    newCats[swapIndex] = temp;
    
    setCategories(newCats);

    // Save to DB
    try {
      await categoryService.reorderCategories([
        { id: newCats[index]._id, displayOrder: newCats[index].displayOrder },
        { id: newCats[swapIndex]._id, displayOrder: newCats[swapIndex].displayOrder },
      ]);
    } catch (error) {
      alert('Failed to save new order');
      fetchCategories(); // Revert
    }
  };

  const renderItem = ({ item, index }: { item: Category, index: number }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.orderControls}>
        <TouchableOpacity onPress={() => moveOrder(index, 'up')} disabled={index === 0}>
          <Ionicons name="chevron-up" size={24} color={index === 0 ? colors.border : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moveOrder(index, 'down')} disabled={index === categories.length - 1}>
          <Ionicons name="chevron-down" size={24} color={index === categories.length - 1 ? colors.border : colors.text} />
        </TouchableOpacity>
      </View>
      
      <Image source={{ uri: item.icon || 'https://via.placeholder.com/60' }} style={styles.catImage} />
      
      <View style={styles.cardInfo}>
        <Text style={[styles.catName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.catDesc, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'Active' ? '#2ECC7122' : '#E74C3C22' }]}>
          <Text style={[styles.badgeText, { color: item.status === 'Active' ? '#27AE60' : '#C0392B' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.name)}>
          <Ionicons name="trash" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Category Management</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={categories}
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
                {editingCat ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category Name *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Diyas"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Icon URL</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={icon}
                onChangeText={setIcon}
                placeholder="https://example.com/icon.png"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Banner URL</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={banner}
                onChangeText={setBanner}
                placeholder="https://example.com/banner.png"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, height: 80 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />

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
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Category</Text>}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  orderControls: { paddingRight: 12, alignItems: 'center', justifyContent: 'center' },
  catImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  cardInfo: { flex: 1 },
  catName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  catDesc: { fontSize: 13, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 12, paddingLeft: 16 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { width: '100%', maxWidth: 500, borderRadius: 16, maxHeight: '90%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  formScroll: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  statusGroup: { flexDirection: 'row', gap: 12 },
  statusPill: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  btn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
