import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList, Dimensions, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { productService, Product } from '@/services/productService';
import { bannerService, Banner } from '@/services/bannerService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart, removeFromCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const prod = await productService.getProductById(id as string);
        setProduct(prod);

        // Fetch similar products using category name as a fallback for now
        // A full migration would have prod.categoryId
        const similar = await productService.getSimilarProducts(id as string, (prod as any).categoryId);
        setSimilarProducts(similar);

        // Fetch dynamic product banner
        const banners = await bannerService.getBanners('Product');
        if (banners && banners.length > 0) {
          setBanner(banners[0]);
        }
      } catch (err) {
        console.log('Failed to load product details', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product?.name} for ₹${product?.price} on Puja Samagri!`,
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const renderSimilarProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.similarCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${item._id}`)}
    >
      <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.similarImage} />
      <View style={styles.similarInfo}>
        <Text style={[styles.similarTitle, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.similarPrice, { color: colors.primary }]}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Product Not Found</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
          The product you are looking for does not exist or has been removed.
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primary, borderRadius: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom PDP Header with Back Button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: colors.backgroundElement }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>Product Details</Text>
        <TouchableOpacity onPress={() => router.push('/cart')} style={{ padding: 8 }}>
          <Ionicons name="cart-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Product Image Gallery (Simplified to single image for now) */}
        <View style={{ backgroundColor: '#fff' }}>
          <Image source={{ uri: product.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.mainImage} />
        </View>

        {/* Product Info */}
        <View style={[styles.infoSection, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              <Ionicons name="star" size={12} color="#fff" style={{ marginLeft: 4 }} />
            </View>
            <Text style={{ color: colors.primary, marginLeft: 12, fontWeight: 'bold' }}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.text }]}>₹{product.price}</Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
            {discount > 0 && (
              <Text style={styles.discountBadge}>{discount}% OFF</Text>
            )}
          </View>
        </View>

        {/* Product Features */}
        {product.features && product.features.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.backgroundElement, marginTop: 8 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Features</Text>
            {product.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: colors.primary }]} />
                <Text style={{ color: colors.textSecondary, flex: 1 }}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Description */}
        <View style={[styles.section, { backgroundColor: colors.backgroundElement, marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
            {product.description || 'No description available for this product.'}
          </Text>
        </View>

        {/* Promotional Banner */}
        {banner && (
          <View style={{ marginTop: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.backgroundElement }}>
            <TouchableOpacity onPress={() => banner.redirectUrl && router.push(banner.redirectUrl as any)}>
              <Image 
                source={{ uri: banner.image }} 
                style={styles.promoBanner} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.backgroundElement, marginTop: 8, marginBottom: 120 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Similar Products</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={similarProducts}
              keyExtractor={(item) => item._id}
              renderItem={renderSimilarProduct}
              contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.stickyActionBar, { backgroundColor: colors.backgroundElement, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.wishlistIconBtn} 
          onPress={() => {
            if (isInWishlist(product._id)) {
              removeFromWishlist(product._id);
            } else {
              addToWishlist(product);
            }
          }}
        >
          <Ionicons name={isInWishlist(product._id) ? "heart" : "heart-outline"} size={24} color={isInWishlist(product._id) ? "#FF4B4B" : colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isInCart(product._id) ? '#388E3C' : '#FF9F00' }]} 
          onPress={() => {
            if (isInCart(product._id)) {
              removeFromCart(product._id);
            } else {
              addToCart(product._id, 1);
            }
          }}
        >
          <Ionicons name={isInCart(product._id) ? "checkmark-circle-outline" : "cart-outline"} size={20} color="#fff" />
          <Text style={styles.actionBtnText}>{isInCart(product._id) ? 'ADDED TO CART' : 'ADD TO CART'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: '#FB641B' }]} 
          onPress={() => {
            addToCart(product._id, 1);
            router.push('/cart');
          }}
        >
          <Ionicons name="flash-outline" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>BUY NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainImage: {
    width: '100%',
    height: width,
    resizeMode: 'contain',
  },
  infoSection: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388E3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 16,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 8,
  },
  promoBanner: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  similarCard: {
    width: 140,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  similarImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  similarInfo: {
    padding: 8,
  },
  similarTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  similarPrice: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  stickyActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wishlistIconBtn: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
