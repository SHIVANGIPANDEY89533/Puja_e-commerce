import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '@/services/paymentService';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [step, setStep] = useState(1);
  
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.mobile || '');
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [couponCode, setCouponCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);

  const deliveryCharge = cartTotal > 500 || cartItems.length === 0 ? 0 : 50;
  const discountAmount = 0; // Enhance with real coupon logic if needed
  const grandTotal = cartTotal + deliveryCharge - discountAmount;

  useEffect(() => {
    if (cartItems.length === 0 && step === 1) {
      alert('Cart is empty');
      router.back();
    }
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      alert('Please provide address and phone number');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'Cash on Delivery') {
        const orderData = {
          razorpayOrderId: '',
          razorpayPaymentId: '',
          razorpaySignature: '',
          userName: user?.name || 'Customer',
          email: user?.email || '',
          phone,
          address,
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
        router.replace('/profile');
      } else {
        // Online Payment - Create Razorpay Order
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
    setLoading(true);
    try {
      const orderData = {
        razorpayOrderId: razorpayOrder.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        userName: user?.name || 'Customer',
        email: user?.email || '',
        phone,
        address,
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
      router.replace('/profile');
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
    return (
      <RazorpayCheckout 
        orderId={razorpayOrder.razorpayOrderId}
        amount={razorpayOrder.amount}
        currency={razorpayOrder.currency}
        publicKey={razorpayOrder.publicKey}
        userEmail={user?.email || ''}
        userPhone={phone}
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Full Address"
                placeholderTextColor={colors.textSecondary}
                value={address}
                onChangeText={setAddress}
                multiline
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, marginTop: 12 }]}
                placeholder="Phone Number"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
                onPress={() => {
                  if(!address || !phone) alert('Please fill details');
                  else setStep(2);
                }}
              >
                <Text style={styles.btnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
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
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 12, borderColor: '#ccc' }
});
