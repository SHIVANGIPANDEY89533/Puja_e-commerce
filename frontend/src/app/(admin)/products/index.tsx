import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl, Image, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { productService, Product } from '@/services/productService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { exportToCSV, exportToPDF, downloadTemplate, parseUploadedFile } from '@/utils/fileUtils';

export default function ProductListScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchProducts = async () => {
    try {
      setError('');
      const data = await productService.getProducts(undefined, search);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]); 

  // Apply Client-Side Filters
  useEffect(() => {
    let result = products;
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active') result = result.filter(p => p.stock > 0);
      if (statusFilter === 'Out of Stock') result = result.filter(p => p.stock <= 0);
    }
    setFilteredProducts(result);
  }, [products, categoryFilter, statusFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [search]);

  // Bulk Upload Logic
  const handleBulkUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const file = result.assets[0];
        const parsedData = await parseUploadedFile(file.uri, file.name, file.mimeType);
        
        if (parsedData.length === 0) {
          throw new Error('The uploaded file is empty or invalid.');
        }

        await productService.bulkUploadProducts(parsedData);
        Alert.alert('Success', `${parsedData.length} products uploaded successfully!`);
        fetchProducts(); // Refresh table
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not process the uploaded file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      if (format === 'csv') exportToCSV('products');
      if (format === 'pdf') exportToPDF('products');
    } catch (err) {
      Alert.alert('Export Failed', 'An error occurred while exporting data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${prodName}"?`)) {
        try {
          await productService.deleteProduct(id);
          fetchProducts();
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete');
        }
      }
    } else {
      Alert.alert('Confirm Delete', `Are you sure you want to delete "${prodName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(id);
              fetchProducts();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
            }
          }
        }
      ]);
    }
  };

  const categories = ['All', 'Diyas', 'Idols', 'Incense', 'Books', 'Other'];
  const statuses = ['All', 'Active', 'Out of Stock'];

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
      <Text style={[styles.tableHeaderText, { width: 60, color: colors.textSecondary }]}>Image</Text>
      <Text style={[styles.tableHeaderText, { flex: 2, color: colors.textSecondary }]}>Product Name</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Category</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Price</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Stock</Text>
      <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textSecondary }]}>Status</Text>
      <Text style={[styles.tableHeaderText, { width: 100, textAlign: 'center', color: colors.textSecondary }]}>Actions</Text>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
      <View style={{ width: 60 }}>
        <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/40' }} style={styles.tableImage} />
      </View>
      <Text style={[styles.tableCell, { flex: 2, color: colors.text, fontWeight: '500' }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
      <Text style={[styles.tableCell, { flex: 1, color: colors.text, fontWeight: '600' }]}>₹{item.price}</Text>
      <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>{item.stock}</Text>
      <View style={{ flex: 1 }}>
        <View style={[styles.statusBadge, { backgroundColor: item.stock > 0 ? '#2ECC7122' : '#E74C3C22' }]}>
          <Text style={[styles.statusText, { color: item.stock > 0 ? '#27AE60' : '#C0392B' }]}>
            {item.stock > 0 ? 'Active' : 'Out of Stock'}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionIcon} onPress={() => router.push(`/(admin)/products/${item._id}`)}>
          <Ionicons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon} onPress={() => handleDelete(item._id, item.name)}>
          <Ionicons name="trash" size={18} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Top Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.background }]}>
        
        {/* Left Side: Search & Filters */}
        <View style={styles.toolbarLeft}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="Search products..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 400 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, marginRight: 8, fontSize: 12, fontWeight: 'bold' }}>CATEGORY:</Text>
              {categories.map(c => (
                <TouchableOpacity key={`cat-${c}`} style={[styles.filterPill, { backgroundColor: categoryFilter === c ? colors.primary : colors.backgroundElement, borderColor: colors.border }]} onPress={() => setCategoryFilter(c)}>
                  <Text style={{ color: categoryFilter === c ? '#fff' : colors.text, fontSize: 12 }}>{c}</Text>
                </TouchableOpacity>
              ))}
              <Text style={{ color: colors.textSecondary, marginHorizontal: 8, fontSize: 12, fontWeight: 'bold' }}>STATUS:</Text>
              {statuses.map(s => (
                <TouchableOpacity key={`stat-${s}`} style={[styles.filterPill, { backgroundColor: statusFilter === s ? colors.primary : colors.backgroundElement, borderColor: colors.border }]} onPress={() => setStatusFilter(s)}>
                  <Text style={{ color: statusFilter === s ? '#fff' : colors.text, fontSize: 12 }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Right Side: Actions */}
        <View style={styles.toolbarRight}>
          
          {/* Export Dropdown Container */}
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={[styles.btnOutline, { borderColor: colors.border }]} onPress={() => setShowExportMenu(!showExportMenu)}>
              <Ionicons name="download-outline" size={18} color={colors.text} />
              <Text style={[styles.btnText, { color: colors.text }]}>Export</Text>
            </TouchableOpacity>
            
            {showExportMenu && (
              <View style={[styles.dropdownMenu, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleExport('csv')}>
                  <Text style={{ color: colors.text }}>Export as CSV</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleExport('pdf')}>
                  <Text style={{ color: colors.text }}>Export as PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.btnOutline, { borderColor: colors.border }]} onPress={handleBulkUpload} disabled={isUploading}>
            {isUploading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="cloud-upload-outline" size={18} color={colors.text} />}
            <Text style={[styles.btnText, { color: colors.text }]}>Bulk Upload</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.btnSolid, { backgroundColor: colors.primary }]} onPress={() => router.push('/(admin)/products/add')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={[styles.btnText, { color: '#fff' }]}>Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={downloadTemplate} style={styles.templateLink}>
        <Text style={{ color: colors.primary, fontSize: 12, textDecorationLine: 'underline' }}>Download CSV Upload Template</Text>
      </TouchableOpacity>

      {/* Table */}
      <View style={[styles.tableContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 800 }}>
            {renderTableHeader()}
            
            {(loading || isExporting) && !filteredProducts.length ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item._id}
                renderItem={renderProductItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40, paddingBottom: 40 }}>
                    {error ? error : 'No products found.'}
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
    marginBottom: 8,
    gap: 16,
    flexWrap: 'wrap',
    zIndex: 10, // For Dropdown
  },
  toolbarLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 300,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 220,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 13,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  btnSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  btnText: { fontWeight: '600', fontSize: 13 },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 140,
    paddingVertical: 4,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  templateLink: {
    marginBottom: 16,
    alignSelf: 'flex-end',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableImage: { width: 40, height: 40, borderRadius: 6 },
  tableCell: {
    fontSize: 14,
    paddingRight: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: { 
    width: 100, 
    flexDirection: 'row', 
    justifyContent: 'center',
    gap: 12 
  },
  actionIcon: { 
    padding: 6, 
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
});
