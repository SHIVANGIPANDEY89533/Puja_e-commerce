import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { productService, Product } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const params = useLocalSearchParams();
  const initialCategory = (params.category as string) || '';
  const initialSearch = (params.search as string) || '';
  const initialSort = (params.sort as string) || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);

  // Fetch from backend ONLY ONCE on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setAllProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter and sort LOCALLY whenever params change
  useEffect(() => {
    let filtered = [...allProducts];
    
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setDisplayedProducts(filtered);
  }, [allProducts, category, search, sort]);

  useEffect(() => {
    // When URL params change externally
    if (params.category !== undefined) setCategory(params.category as string);
    if (params.search !== undefined) {
      setSearch(params.search as string);
      handleSearch(params.search as string);
    }
  }, [params.category, params.search]);

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => router.push('/')} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {category ? category : search ? `Search: ${search}` : 'All Products'}
        </Text>
      </View>
      <SearchBar onSearch={handleSearch} />
      
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: sort === '' ? colors.primary : colors.backgroundElement, borderColor: colors.border }]}
            onPress={() => setSort('')}
          >
            <Text style={{ color: sort === '' ? '#fff' : colors.text }}>Relevance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: sort === 'price_asc' ? colors.primary : colors.backgroundElement, borderColor: colors.border }]}
            onPress={() => setSort('price_asc')}
          >
            <Text style={{ color: sort === 'price_asc' ? '#fff' : colors.text }}>Price: Low to High</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: sort === 'price_desc' ? colors.primary : colors.backgroundElement, borderColor: colors.border }]}
            onPress={() => setSort('price_desc')}
          >
            <Text style={{ color: sort === 'price_desc' ? '#fff' : colors.text }}>Price: High to Low</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: sort === 'rating' ? colors.primary : colors.backgroundElement, borderColor: colors.border }]}
            onPress={() => setSort('rating')}
          >
            <Text style={{ color: sort === 'rating' ? '#fff' : colors.text }}>Top Rated</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : displayedProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>No Products Found</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Try adjusting your search or filters.</Text>
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    width: '48%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
