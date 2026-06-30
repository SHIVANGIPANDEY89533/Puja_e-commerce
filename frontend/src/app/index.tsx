import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategorySlider from '@/components/CategorySlider';
import BannerCarousel from '@/components/BannerCarousel';
import HorizontalProductList from '@/components/HorizontalProductList';
import { productService, Product } from '@/services/productService';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch products. Is your backend server running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  // Filter products by category dynamically
  const topSelling = products.slice(0, 5); // Mock top selling logic for now
  
  const isMatch = (p: Product, keywords: string[]) => {
    const text = `${p.category || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
    return keywords.some(k => text.includes(k));
  };

  const dailyPuja = products.filter(p => isMatch(p, ['daily puja', 'daily-puja', 'samagri', 'diya', 'cotton wick']));
  const havan = products.filter(p => isMatch(p, ['havan', 'hawan', 'wood', 'samidha']));
  const bartan = products.filter(p => isMatch(p, ['bartan', 'brass', 'copper', 'thali', 'kalash', 'lota']));
  const murti = products.filter(p => isMatch(p, ['murti', 'idol', 'statue', 'ganesh', 'laxmi', 'shiv']));
  const flowers = products.filter(p => isMatch(p, ['flower', 'garland', 'mala', 'rose', 'marigold']));

  // Base UI sections that always render
  const sections = [
    { id: 'search', component: <SearchBar onSearch={setSearchQuery} /> },
  ];

  // Dynamic Product Sections - Only render if products exist for that category
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    const searchResults = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
    sections.push({ 
      id: 'search_results', 
      component: <HorizontalProductList title={`Search Results for "${searchQuery}"`} data={searchResults} /> 
    });
  } else {
    sections.push({ id: 'categories', component: <CategorySlider /> });
    sections.push({ id: 'banners', component: <BannerCarousel /> });
    if (topSelling.length > 0) sections.push({ id: 'top_selling', component: <HorizontalProductList title="Top Selling Puja Items" data={topSelling} onPressViewMore={() => router.push('/explore?sort=rating')} /> });
    if (dailyPuja.length > 0) sections.push({ id: 'daily_puja', component: <HorizontalProductList title="Daily Puja Samagri" data={dailyPuja} onPressViewMore={() => router.push('/explore?category=Daily%20Puja')} /> });
    if (havan.length > 0) sections.push({ id: 'havan', component: <HorizontalProductList title="Havan Samagri" data={havan} onPressViewMore={() => router.push('/explore?category=Havan')} /> });
    if (bartan.length > 0) sections.push({ id: 'bartan', component: <HorizontalProductList title="Puja Bartan" data={bartan} onPressViewMore={() => router.push('/explore?category=Bartan')} /> });
    if (murti.length > 0) sections.push({ id: 'murti', component: <HorizontalProductList title="Murti Collection" data={murti} onPressViewMore={() => router.push('/explore?category=Murti')} /> });
    if (flowers.length > 0) sections.push({ id: 'flowers', component: <HorizontalProductList title="Flowers & Garland" data={flowers} onPressViewMore={() => router.push('/explore?category=Flowers')} /> });
  }

  // Handle network states
  if (loading && !refreshing) {
    sections.push({
      id: 'loading',
      component: (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading amazing products...</Text>
        </View>
      )
    });
  } else if (error) {
    sections.push({
      id: 'error',
      component: (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 12, fontWeight: 'bold' }}>{error}</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Make sure your MERN backend is running on localhost:5000</Text>
        </View>
      )
    });
  } else if (products.length === 0) {
    sections.push({
      id: 'empty',
      component: (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 16 }}>No products found.</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>Start adding inventory from your Admin Panel!</Text>
        </View>
      )
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.component}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
