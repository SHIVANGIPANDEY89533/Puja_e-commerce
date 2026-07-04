import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '@/services/paymentService';

export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAdminPaymentById(id as string);
      setPayment(data);
    } catch (error) {
      console.error('Failed to fetch payment', error);
      Alert.alert('Error', 'Failed to load payment details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return '#4CAF50';
      case 'Collected': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Failed': return '#F44336';
      case 'Refunded': return '#9C27B0';
      default: return colors.textSecondary;
    }
  };

  const InfoRow = ({ label, value, isLink, onPress }: { label: string, value: any, isLink?: boolean, onPress?: () => void }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      {isLink ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.infoValue, { color: colors.primary, textDecorationLine: 'underline' }]}>{value}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'N/A'}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!payment) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(payment.paymentStatus) + '15' }]}>
          <Ionicons 
            name={payment.paymentStatus === 'Success' || payment.paymentStatus === 'Collected' ? 'checkmark-circle' : 'time'} 
            size={32} 
            color={getStatusColor(payment.paymentStatus)} 
          />
          <View style={{ marginLeft: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: getStatusColor(payment.paymentStatus) }}>
              {payment.paymentStatus}
            </Text>
            <Text style={{ color: getStatusColor(payment.paymentStatus), opacity: 0.8 }}>
              {payment.amount} {payment.currency}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction Information</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <InfoRow label="Internal Payment ID" value={payment._id} />
            <InfoRow label="Transaction ID" value={payment.transactionId} />
            <InfoRow 
              label="Order ID" 
              value={payment.orderId?._id || payment.orderId} 
              isLink={true}
              onPress={() => router.push(`/(admin)/orders/${payment.orderId?._id || payment.orderId}`)}
            />
            <InfoRow label="Razorpay Order ID" value={payment.razorpayOrderId} />
            <InfoRow label="Razorpay Payment ID" value={payment.razorpayPaymentId} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Information</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <InfoRow label="Name" value={payment.customerName} />
            <InfoRow label="Email" value={payment.customerEmail} />
            <InfoRow label="Phone" value={payment.customerPhone} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Information</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <InfoRow label="Amount" value={`₹${payment.amount}`} />
            <InfoRow label="Currency" value={payment.currency} />
            <InfoRow label="Gateway" value={payment.paymentGateway} />
            <InfoRow label="Method" value={payment.paymentMethod} />
            <InfoRow label="Created At" value={new Date(payment.createdAt).toLocaleString()} />
            <InfoRow label="Paid At" value={payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'Not Paid'} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security & Verification</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Signature Verification</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name={payment.signatureVerified ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={payment.signatureVerified ? "#4CAF50" : "#F44336"} 
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.infoValue, { color: payment.signatureVerified ? '#4CAF50' : '#F44336' }]}>
                  {payment.signatureVerified ? 'Verified' : payment.paymentGateway === 'COD' ? 'Not Applicable' : 'Failed'}
                </Text>
              </View>
            </View>
            <InfoRow label="Razorpay Signature" value={payment.razorpaySignature ? `${payment.razorpaySignature.substring(0, 10)}...` : 'N/A'} />
          </View>
        </View>

        <View style={[styles.section, { paddingBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/(admin)/orders/${payment.orderId?._id || payment.orderId}`)}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>View Related Order</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 24 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14, flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '500', flex: 2, textAlign: 'right' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  }
});
