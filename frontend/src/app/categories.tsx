import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { productService, Product, Category } from '@/services/productService';
import { useRouter } from 'expo-router';
import { useWishlist } from '@/context/WishlistContext';

export default function CategoriesScreen() {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 4 : 2; // Responsive grid
  const itemWidth = (width - 24 - (numColumns - 1) * 12) / numColumns; // 24 is padding, 12 is gap

  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState(''); // e.g. 'price_asc', 'price_desc', 'newest', 'rating'

  // Fetch Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts(selectedCategoryId || undefined, searchQuery || undefined, sort || undefined);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [selectedCategoryId, searchQuery, sort]);

  const renderProduct = ({ item }: { item: Product }) => {
    const discount = item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    const isWished = isInWishlist(item._id);

    const toggleWishlist = () => {
      if (isWished) {
        removeFromWishlist(item._id);
      } else {
        addToWishlist(item);
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.productCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border, width: itemWidth }]}
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.productImage} />
        
        {/* Wishlist Button Overlay */}
        <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist}>
          <Ionicons name={isWished ? "heart" : "heart-outline"} size={20} color={isWished ? "#FF4B4B" : "#888"} />
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              <Ionicons name="star" size={10} color="#fff" style={{ marginLeft: 2 }} />
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>₹{item.price}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
            {discount > 0 && (
              <Text style={styles.discountText}>{discount}% off</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={{ backgroundColor: colors.backgroundElement, marginBottom: 8, paddingBottom: 12 }}>
      <Header />
      <SearchBar onSearch={setSearchQuery} />
      
      {/* Category Horizontal Selector */}
      <View style={{ marginTop: 12 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ _id: '', name: 'All Products' }, ...categories]}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = item._id === selectedCategoryId;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: isSelected ? colors.primary : (scheme === 'dark' ? '#333' : '#F0F0F0'),
                    borderColor: isSelected ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setSelectedCategoryId(item._id)}
              >
                <Text style={{ 
                  color: isSelected ? '#fff' : colors.text,
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sort & Filter Bar */}
      <View style={[styles.filterBar, { borderTopColor: colors.border }]}>
        <Text style={{ color: colors.textSecondary, flex: 1, fontSize: 12 }}>
          {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
        </Text>
        
        {/* Simple Sort Dropdown Mocks */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => setSort('newest')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="swap-vertical" size={16} color={sort === 'newest' ? colors.primary : colors.text} />
            <Text style={{ marginLeft: 4, color: sort === 'newest' ? colors.primary : colors.text, fontSize: 12 }}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSort(sort === 'price_asc' ? 'price_desc' : 'price_asc')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="cash-outline" size={16} color={sort?.includes('price') ? colors.primary : colors.text} />
            <Text style={{ marginLeft: 4, color: sort?.includes('price') ? colors.primary : colors.text, fontSize: 12 }}>
              Price {sort === 'price_asc' ? '↑' : (sort === 'price_desc' ? '↓' : '')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={products}
        extraData={wishlist}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        numColumns={numColumns}
        key={numColumns} // Force re-render on orientation change
        contentContainerStyle={{ paddingBottom: 80 }}
        columnWrapperStyle={{ paddingHorizontal: 12, gap: 12 }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No products found in this category.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388E3C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: 'bold',
  },
});
