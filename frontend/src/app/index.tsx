import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, RefreshControl, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategorySlider from '@/components/CategorySlider';
import BannerCarousel from '@/components/BannerCarousel';
import HorizontalProductList from '@/components/HorizontalProductList';
import ProductCard from '@/components/ProductCard';
import { productService, Product, setGlobalCategory } from '@/services/productService';
import { useRouter, useNavigation } from 'expo-router';

export default function HomeScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

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

  useEffect(() => {
    // @ts-ignore: tabPress is dynamically available when used within Tabs
    const unsubscribe = navigation.addListener('tabPress', (e: any) => {
      if (navigation.isFocused()) {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        setSelectedCategoryId(null);
        setSearchQuery('');
        onRefresh();
      }
    });
    return unsubscribe;
  }, [navigation, onRefresh]);

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

  // Fetch categories to match names for View More links
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const getCategoryIdByKeyword = (keyword: string) => {
    return categories.find(c => c.name.toLowerCase().includes(keyword))?._id || '';
  };

  // Base UI sections that always render
  const sections: any[] = [];

  // Dynamic Product Sections - Only render if products exist for that category
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    const searchResults = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      (typeof p.category === 'string' ? p.category.toLowerCase().includes(query) : p.category?.name?.toLowerCase().includes(query))
    );
    sections.push({ 
      id: 'search_results', 
      component: <HorizontalProductList title={`Search Results for "${searchQuery}"`} data={searchResults} /> 
    });
  } else if (selectedCategoryId) {
    const categoryProducts = products.filter(p => {
      const pCat = p.category as any;
      return pCat === selectedCategoryId || pCat?._id === selectedCategoryId;
    });
    const selectedCat = categories.find(c => c._id === selectedCategoryId);
    const categoryName = selectedCat ? selectedCat.name : 'Category';

    sections.push({
      id: 'category_results',
      component: (
        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            {categoryName} Products
          </Text>
          {categoryProducts.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>No products found in this category.</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
              {categoryProducts.map(p => (
                <View key={p._id} style={{ width: '48%', marginBottom: 12 }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}
        </View>
      )
    });
  } else {
    sections.push({ id: 'banners', component: <BannerCarousel /> });
    if (topSelling.length > 0) sections.push({ id: 'top_selling', component: <HorizontalProductList title="Top Selling Puja Items" data={topSelling} onPressViewMore={() => setSelectedCategoryId(getCategoryIdByKeyword('top') || categories[0]?._id)} /> });
    if (dailyPuja.length > 0) sections.push({ id: 'daily_puja', component: <HorizontalProductList title="Daily Puja Samagri" data={dailyPuja.slice(0, 5)} onPressViewMore={() => setSelectedCategoryId(getCategoryIdByKeyword('daily') || getCategoryIdByKeyword('samagri'))} /> });
    if (havan.length > 0) sections.push({ id: 'havan', component: <HorizontalProductList title="Havan Samagri" data={havan.slice(0, 5)} onPressViewMore={() => setSelectedCategoryId(getCategoryIdByKeyword('havan') || getCategoryIdByKeyword('hawan'))} /> });
    if (bartan.length > 0) sections.push({ id: 'bartan', component: <HorizontalProductList title="Puja Bartan" data={bartan.slice(0, 5)} onPressViewMore={() => setSelectedCategoryId(getCategoryIdByKeyword('bartan') || getCategoryIdByKeyword('brass'))} /> });
    if (murti.length > 0) sections.push({ id: 'murti', component: <HorizontalProductList title="Murti Collection" data={murti.slice(0, 5)} onPressViewMore={() => setSelectedCategoryId(getCategoryIdByKeyword('murti') || getCategoryIdByKeyword('idol'))} /> });
    if (flowers.length > 0) sections.push({ id: 'flowers', component: <HorizontalProductList title="Flowers & Garland" data={flowers.slice(0, 5)} onPressViewMore={() => setSelectedCategoryId(getCategoryIdByKeyword('flower') || getCategoryIdByKeyword('mala'))} /> });
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
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Make sure your backend is running on https://puja-e-commerce.onrender.com</Text>
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
      <View style={{ backgroundColor: colors.backgroundElement, paddingBottom: 12 }}>
        <Header />
        <SearchBar onSearch={setSearchQuery} />
        {searchQuery.trim() === '' && (
          <View style={{ marginTop: 8 }}>
            <CategorySlider 
              selectedCategoryId={selectedCategoryId} 
              onSelectCategory={(id) => setSelectedCategoryId(prev => prev === id ? null : id)} 
            />
          </View>
        )}
      </View>
      <FlatList
        ref={flatListRef}
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
