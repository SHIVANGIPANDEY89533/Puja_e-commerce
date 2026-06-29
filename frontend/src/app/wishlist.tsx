import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/services/productService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import Header from '@/components/Header';

export default function WishlistScreen() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 4 : 2; 
  const itemWidth = (width - 24 - (numColumns - 1) * 12) / numColumns; 

  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const renderProduct = ({ item }: { item: Product }) => {
    const discount = item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity 
        style={[styles.productCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border, width: itemWidth }]}
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.productImage} />
        
        <TouchableOpacity style={styles.wishlistBtn} onPress={() => removeFromWishlist(item._id)}>
          <Ionicons name="heart" size={20} color="#FF4B4B" />
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
          
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

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Wishlist ({wishlist.length})</Text>
        </View>

        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          numColumns={numColumns}
          key={numColumns}
          contentContainerStyle={{ paddingBottom: 80 }}
          columnWrapperStyle={{ paddingHorizontal: 12, gap: 12 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your wishlist is empty.</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Explore categories and add your favorite items here.</Text>
              <TouchableOpacity 
                style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/categories')}
              >
                <Text style={styles.exploreBtnText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
