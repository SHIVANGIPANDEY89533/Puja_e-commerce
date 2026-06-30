import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CouponsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  // Mock coupons since backend doesn't support user-specific fetched coupons yet
  const coupons = [
    { code: 'WELCOME50', desc: 'Flat ₹50 off on your first order', expires: '2026-12-31' },
    { code: 'FESTIVAL20', desc: '20% off on all Murti Collections', expires: '2026-10-31' },
    { code: 'FREEDEL', desc: 'Free Delivery on orders above ₹500', expires: 'Valid Always' },
  ];

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Coupons</Text>
        </View>

        <ScrollView style={styles.content}>
          {coupons.map((coupon, idx) => (
            <View key={idx} style={[styles.couponCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <View style={[styles.leftSection, { borderRightColor: colors.border }]}>
                <Text style={[styles.discount, { color: colors.primary }]}>{coupon.code.includes('50') ? '₹50' : coupon.code.includes('20') ? '20%' : 'FREE'}</Text>
                <Text style={[styles.offText, { color: colors.textSecondary }]}>OFF</Text>
              </View>
              <View style={styles.rightSection}>
                <View style={styles.codeContainer}>
                  <Text style={[styles.code, { color: colors.text }]}>{coupon.code}</Text>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.desc, { color: colors.textSecondary }]}>{coupon.desc}</Text>
                <Text style={[styles.expires, { color: colors.textSecondary }]}>Expires: {coupon.expires}</Text>
              </View>
            </View>
          ))}
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginRight: 8, marginLeft: -8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  couponCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  leftSection: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderStyle: 'dashed',
    width: 100,
  },
  discount: { fontSize: 24, fontWeight: 'bold' },
  offText: { fontSize: 12, fontWeight: 'bold' },
  rightSection: {
    flex: 1,
    padding: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  code: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  desc: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  expires: { fontSize: 12, fontWeight: '500' }
});
