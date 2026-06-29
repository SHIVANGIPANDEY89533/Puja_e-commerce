import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const deliveryCharge = cartTotal > 500 || cartItems.length === 0 ? 0 : 50;
  const discount = 0; // Hook into coupon system later
  const grandTotal = cartTotal + deliveryCharge - discount;

  const handleRemove = (productId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) }
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearCart }
    ]);
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
      <Image 
        source={{ uri: item.product.images?.[0] || 'https://via.placeholder.com/100' }} 
        style={styles.itemImage} 
      />
      
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.text }]}>₹{item.price}</Text>
        
        <View style={styles.actionRow}>
          <View style={[styles.quantitySelector, { borderColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.product._id)}>
            <Ionicons name="trash-outline" size={20} color="#FF4B4B" />
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={{ color: '#FF4B4B', fontWeight: 'bold' }}>Clear Cart</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && cartItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cart-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Your Cart is Empty</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add items to it now.</Text>
            <TouchableOpacity 
              style={[styles.shopBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/categories')}
            >
              <Text style={styles.shopBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product._id}
            renderItem={renderCartItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListFooterComponent={
              <View style={[styles.summaryContainer, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Price Details</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={{ color: colors.textSecondary }}>Price ({cartItems.length} items)</Text>
                  <Text style={{ color: colors.text }}>₹{cartTotal}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={{ color: colors.textSecondary }}>Delivery Charges</Text>
                  <Text style={{ color: deliveryCharge === 0 ? '#388E3C' : colors.text }}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </Text>
                </View>

                {discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={{ color: colors.textSecondary }}>Discount</Text>
                    <Text style={{ color: '#388E3C' }}>-₹{discount}</Text>
                  </View>
                )}

                <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.totalText, { color: colors.text }]}>Total Amount</Text>
                  <Text style={[styles.totalText, { color: colors.text }]}>₹{grandTotal}</Text>
                </View>
              </View>
            }
          />
        )}

        {cartItems.length > 0 && (
          <View style={[styles.checkoutBar, { backgroundColor: colors.backgroundElement, borderTopColor: colors.border }]}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total</Text>
              <Text style={[styles.checkoutTotal, { color: colors.text }]}>₹{grandTotal}</Text>
            </View>
            <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: '#FB641B' }]}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  shopBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    paddingHorizontal: 12,
    fontWeight: 'bold',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: {
    color: '#FF4B4B',
    fontWeight: 'bold',
    fontSize: 12,
  },
  summaryContainer: {
    marginTop: 8,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
