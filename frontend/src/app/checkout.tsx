import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '@/services/paymentService';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { addressService, Address } from '@/services/addressService';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [step, setStep] = useState(1);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [couponCode, setCouponCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);

  const deliveryCharge = cartTotal > 500 || cartItems.length === 0 ? 0 : 50;
  const discountAmount = 0;
  const grandTotal = cartTotal + deliveryCharge - discountAmount;

  useEffect(() => {
    if (cartItems.length === 0 && step === 1) {
      alert('Cart is empty');
      router.back();
    }
  }, [cartItems]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
      if (data.length > 0 && !selectedAddressId) {
        // Auto-select default or first address
        const def = data.find(a => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else setSelectedAddressId(data[0]._id);
      }
    } catch (err) {
      console.log('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const getFullAddressString = (addr: Address) => {
    return `${addr.fullName}, ${addr.phone} | ${addr.flat}, ${addr.area}${addr.landmark ? ', ' + addr.landmark : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
  };

  const handlePlaceOrder = async () => {
    const selectedAddr = addresses.find(a => a._id === selectedAddressId);
    if (!selectedAddr) {
      alert('Please select a delivery address');
      return;
    }

    setLoading(true);
    const addressSnapshot = getFullAddressString(selectedAddr);

    try {
      if (paymentMethod === 'Cash on Delivery') {
        const orderData = {
          razorpayOrderId: '',
          razorpayPaymentId: '',
          razorpaySignature: '',
          userName: selectedAddr.fullName,
          email: user?.email || '',
          phone: selectedAddr.phone,
          address: addressSnapshot,
          items: cartItems.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.price,
            qty: item.quantity
          })),
          total: grandTotal,
          paymentMethod,
          discountAmount
        };
        
        await paymentService.verifyPayment(orderData);
        await clearCart();
        Alert.alert(
          'Order Placed! 🎉', 
          'Your Cash on Delivery order has been placed successfully.',
          [{ text: 'OK', onPress: () => router.replace('/my-orders') }]
        );
      } else {
        const order = await paymentService.createOrder({
          items: cartItems.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.price,
            qty: item.quantity
          })),
          couponCode
        });
        
        setRazorpayOrder(order);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSuccess = async (paymentId: string, signature: string) => {
    const selectedAddr = addresses.find(a => a._id === selectedAddressId);
    if (!selectedAddr) return;

    setLoading(true);
    try {
      const orderData = {
        razorpayOrderId: razorpayOrder.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        userName: selectedAddr.fullName,
        email: user?.email || '',
        phone: selectedAddr.phone,
        address: getFullAddressString(selectedAddr),
        items: cartItems.map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.price,
          qty: item.quantity
        })),
        total: grandTotal,
        paymentMethod: 'Online',
        discountAmount
      };
      
      await paymentService.verifyPayment(orderData);
      await clearCart();
      setRazorpayOrder(null);
      Alert.alert(
        'Payment Successful! 🎉',
        'Your order has been placed successfully.',
        [{ text: 'OK', onPress: () => router.replace('/my-orders') }]
      );
    } catch (err: any) {
      alert('Payment verification failed');
      setRazorpayOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const onPaymentError = (error: any) => {
    alert('Payment Failed or Cancelled');
    setRazorpayOrder(null);
  };

  if (razorpayOrder) {
    const selectedAddr = addresses.find(a => a._id === selectedAddressId);
    return (
      <RazorpayCheckout 
        orderId={razorpayOrder.razorpayOrderId}
        amount={razorpayOrder.amount}
        currency={razorpayOrder.currency}
        publicKey={razorpayOrder.publicKey}
        userEmail={user?.email || ''}
        userPhone={selectedAddr?.phone || ''}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
        onCancel={() => setRazorpayOrder(null)}
      />
    );
  }

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            <Text style={{ color: step >= 1 ? colors.primary : colors.textSecondary, fontWeight: 'bold' }}>Address</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
            <Text style={{ color: step >= 2 ? colors.primary : colors.textSecondary, fontWeight: 'bold' }}>Summary</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
            <Text style={{ color: step >= 3 ? colors.primary : colors.textSecondary, fontWeight: 'bold' }}>Payment</Text>
          </View>

          {step === 1 && (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Delivery Address</Text>
                <TouchableOpacity onPress={() => router.push('/addresses/add')}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add New</Text>
                </TouchableOpacity>
              </View>

              {loadingAddresses ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : addresses.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>No saved addresses found.</Text>
                  <TouchableOpacity 
                    style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary + '20', borderRadius: 8 }}
                    onPress={() => router.push('/addresses/add')}
                  >
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                addresses.map(addr => (
                  <TouchableOpacity
                    key={addr._id}
                    style={[
                      styles.addressOption, 
                      { borderColor: colors.border },
                      selectedAddressId === addr._id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                    ]}
                    onPress={() => setSelectedAddressId(addr._id)}
                  >
                    <View style={styles.addressRadio}>
                      {selectedAddressId === addr._id && <View style={[styles.addressRadioInner, { backgroundColor: colors.primary }]} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{addr.fullName}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>{addr.addressType}</Text>
                        </View>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                        {addr.flat}, {addr.area}{addr.landmark ? `, ${addr.landmark}` : ''}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                        {addr.city}, {addr.state} - {addr.pincode}
                      </Text>
                      <Text style={{ color: colors.text, fontSize: 13, marginTop: 4, fontWeight: '500' }}>
                        Phone: {addr.phone}
                      </Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => router.push(`/addresses/add?id=${addr._id}`)} style={{ padding: 8 }}>
                      <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24, opacity: !selectedAddressId ? 0.5 : 1 }]}
                onPress={() => {
                  if(!selectedAddressId) alert('Please select a delivery address');
                  else setStep(2);
                }}
                disabled={!selectedAddressId}
              >
                <Text style={styles.btnText}>Deliver Here</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
              
              <View style={[styles.addressSnapshot, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Delivering to:</Text>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }} numberOfLines={2}>
                  {addresses.find(a => a._id === selectedAddressId) ? getFullAddressString(addresses.find(a => a._id === selectedAddressId)!) : ''}
                </Text>
              </View>

              {cartItems.map((item, index) => (
                <View key={index} style={styles.summaryItem}>
                  <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>{item.product.name} (x{item.quantity})</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              
              <View style={[styles.totalDivider, { borderColor: colors.border }]} />
              
              <View style={styles.summaryItem}>
                <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
                <Text style={{ color: colors.text }}>₹{cartTotal}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={{ color: colors.textSecondary }}>Delivery</Text>
                <Text style={{ color: colors.text }}>₹{deliveryCharge}</Text>
              </View>

              <View style={[styles.totalDivider, { borderColor: colors.border }]} />
              
              <View style={styles.summaryItem}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Total Amount</Text>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>₹{grandTotal}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
                onPress={() => setStep(3)}
              >
                <Text style={styles.btnText}>Continue to Payment</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
              
              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'Online' && { borderColor: colors.primary }]}
                onPress={() => setPaymentMethod('Online')}
              >
                <Ionicons name="card-outline" size={24} color={paymentMethod === 'Online' ? colors.primary : colors.textSecondary} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>Pay Online (Razorpay)</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>UPI, Credit/Debit Card, Net Banking</Text>
                </View>
                {paymentMethod === 'Online' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'Cash on Delivery' && { borderColor: colors.primary }]}
                onPress={() => setPaymentMethod('Cash on Delivery')}
              >
                <Ionicons name="cash-outline" size={24} color={paymentMethod === 'Cash on Delivery' ? colors.primary : colors.textSecondary} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cash on Delivery</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Pay when you receive the order</Text>
                </View>
                {paymentMethod === 'Cash on Delivery' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24, opacity: loading ? 0.7 : 1 }]}
                onPress={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Place Order (₹{grandTotal})</Text>}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, marginBottom: 24 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 48 },
  primaryBtn: { padding: 16, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalDivider: { borderTopWidth: 1, marginVertical: 12 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 12, borderColor: '#ccc' },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addressRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressSnapshot: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  }
});
