import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { addressService, Address } from '@/services/addressService';

export default function AddressesScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (error: any) {
      console.log('Error fetching addresses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleDelete = (id: string) => {
    if (window.confirm ? window.confirm('Are you sure you want to delete this address?') : true) {
      addressService.deleteAddress(id).then(() => {
        fetchAddresses();
      }).catch(err => {
        alert(err.response?.data?.message || 'Error deleting address');
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.updateAddress(id, { isDefault: true });
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error setting default address');
    }
  };

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Saved Addresses</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            <TouchableOpacity 
              style={[styles.addButton, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
              onPress={() => router.push('/addresses/add')}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
              <Text style={[styles.addText, { color: colors.primary }]}>Add New Address</Text>
            </TouchableOpacity>

            {addresses.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons name="location-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No saved addresses found.</Text>
              </View>
            ) : (
              addresses.map(addr => (
                <View key={addr._id} style={[styles.addressCard, { backgroundColor: colors.backgroundElement, borderColor: addr.isDefault ? colors.primary : colors.border }]}>
                  {addr.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                  <View style={styles.addressHeader}>
                    <Ionicons name={addr.addressType === 'Home' ? 'home' : addr.addressType === 'Office' ? 'business' : 'location'} size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={[styles.addressName, { color: colors.text }]}>{addr.addressType} - {addr.fullName}</Text>
                  </View>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {addr.flat}, {addr.area}{addr.landmark ? `, near ${addr.landmark}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                  </Text>
                  <Text style={[styles.phoneText, { color: colors.textSecondary }]}>Phone: {addr.phone}</Text>
                  
                  <View style={[styles.actions, { borderTopColor: colors.border }]}>
                    {!addr.isDefault && (
                      <>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleSetDefault(addr._id)}>
                          <Text style={[styles.actionText, { color: colors.text }]}>Set Default</Text>
                        </TouchableOpacity>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      </>
                    )}
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/addresses/add?id=${addr._id}`)}>
                      <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(addr._id)}>
                      <Text style={[styles.actionText, { color: 'red' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 24,
  },
  addText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  addressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  defaultBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  defaultText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  addressName: { fontSize: 16, fontWeight: 'bold' },
  addressText: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  phoneText: { fontSize: 14, fontWeight: '500', marginBottom: 16 },
  actions: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 12 },
  actionButton: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  actionText: { fontWeight: 'bold' },
  divider: { width: 1, height: '100%' }
});
