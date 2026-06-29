import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Product } from '@/services/productService';
import { useRouter } from 'expo-router';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart, removeFromCart } = useCart();

  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isWished = isInWishlist(product._id);
  const inCart = isInCart(product._id);

  const toggleWishlist = () => {
    if (isWished) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    if (inCart) {
      removeFromCart(product._id);
    } else {
      addToCart(product._id, 1);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product._id}`)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: product.images?.[0] || 'https://images.unsplash.com/photo-1605847444195-223040b5d97d?w=500&auto=format&fit=crop&q=60' }} 
        style={styles.image} 
        resizeMode="cover" 
      />
      
      {discountPercent > 0 ? (
        <View style={[styles.discountBadge, { backgroundColor: colors.discount }]}>
          <Text style={styles.discountText}>{discountPercent}% OFF</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist}>
        <Ionicons name={isWished ? "heart" : "heart-outline"} size={20} color={isWished ? "#FF4B4B" : colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color={colors.secondary} />
          <Text style={[styles.rating, { color: colors.textSecondary }]}>{product.rating.toFixed(1)}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.text }]}>₹{product.price}</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: inCart ? '#388E3C' : colors.primary }]}
            onPress={handleAddToCart}
          >
            <Text style={styles.addButtonText}>{inCart ? 'Added' : 'Add'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 4,
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    height: 34,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
