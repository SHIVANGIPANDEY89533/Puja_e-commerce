import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { productService } from '@/services/productService';
import { categoryService, Category } from '@/services/categoryService';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AddProductScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [features, setFeatures] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.getAllCategories().then(data => setCategories(data)).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!name || !category || !price) {
      Alert.alert('Validation Error', 'Name, Category, and Price are required.');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name,
        category,
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        stock: Number(stock || 0),
        description,
        images: image ? [image] : [],
        features: features.split(',').map(f => f.trim()).filter(f => f.length > 0),
      };

      await productService.addProduct(productData);
      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: colors.text }]}>Product Name *</Text>
      <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]} value={name} onChangeText={setName} placeholder="Enter product name" placeholderTextColor={colors.textSecondary} />

      <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {categories.map(c => (
          <TouchableOpacity 
            key={c._id} 
            onPress={() => setCategory(c.name)}
            style={{ 
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, 
              backgroundColor: category === c.name || category === c._id ? colors.primary : colors.backgroundElement,
              borderWidth: 1, borderColor: colors.border
            }}
          >
            <Text style={{ color: category === c.name || category === c._id ? '#fff' : colors.text, fontSize: 14 }}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement, marginTop: 8 }]} value={category} onChangeText={setCategory} placeholder="Or type a new category name..." placeholderTextColor={colors.textSecondary} />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.label, { color: colors.text }]}>Selling Price (₹) *</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textSecondary} />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.label, { color: colors.text }]}>Original Price (₹)</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]} value={originalPrice} onChangeText={setOriginalPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textSecondary} />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Stock Quantity</Text>
      <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="e.g. 50" placeholderTextColor={colors.textSecondary} />

      <Text style={[styles.label, { color: colors.text }]}>Image URL</Text>
      <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]} value={image} onChangeText={setImage} placeholder="https://..." placeholderTextColor={colors.textSecondary} />

      <Text style={[styles.label, { color: colors.text }]}>Features (Comma Separated)</Text>
      <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, height: 80, textAlignVertical: 'top', backgroundColor: colors.backgroundElement }]} value={features} onChangeText={setFeatures} multiline numberOfLines={3} placeholder="Handcrafted, Premium Quality, ..." placeholderTextColor={colors.textSecondary} />

      <Text style={[styles.label, { color: colors.text }]}>Description</Text>
      <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, height: 100, textAlignVertical: 'top', backgroundColor: colors.backgroundElement }]} value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Describe the product..." placeholderTextColor={colors.textSecondary} />

      <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Save Product</Text>}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: { flexDirection: 'row' },
  submitButton: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
