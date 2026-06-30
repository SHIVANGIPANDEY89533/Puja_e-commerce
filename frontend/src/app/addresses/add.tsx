import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { addressService, AddressInput } from '@/services/addressService';

export default function AddAddressScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  
  const [formData, setFormData] = useState<AddressInput>({
    fullName: '',
    phone: '',
    flat: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    isDefault: false,
  });

  useEffect(() => {
    if (editId) {
      addressService.getAddressById(editId)
        .then(data => {
          setFormData({
            fullName: data.fullName,
            phone: data.phone,
            flat: data.flat,
            area: data.area,
            landmark: data.landmark || '',
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            addressType: data.addressType,
            isDefault: data.isDefault,
          });
        })
        .catch(err => {
          alert('Failed to load address');
          router.back();
        })
        .finally(() => setFetching(false));
    }
  }, [editId]);

  const handleChange = (field: keyof AddressInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phone || !formData.flat || !formData.area || !formData.city || !formData.state || !formData.pincode) {
      return alert('Please fill all required fields');
    }

    setLoading(true);
    try {
      if (editId) {
        await addressService.updateAddress(editId, formData);
      } else {
        await addressService.createAddress(formData);
      }
      router.back();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{editId ? 'Edit Address' : 'Add New Address'}</Text>
        </View>

        {fetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                value={formData.fullName} onChangeText={t => handleChange('fullName', t)} />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Mobile Number *</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                value={formData.phone} onChangeText={t => handleChange('phone', t)} keyboardType="phone-pad" />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>House/Flat No. *</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                value={formData.flat} onChangeText={t => handleChange('flat', t)} />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Street/Area *</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                value={formData.area} onChangeText={t => handleChange('area', t)} />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Landmark (Optional)</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                value={formData.landmark} onChangeText={t => handleChange('landmark', t)} />
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>City *</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                  value={formData.city} onChangeText={t => handleChange('city', t)} />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>State *</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                  value={formData.state} onChangeText={t => handleChange('state', t)} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Pincode *</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} 
                value={formData.pincode} onChangeText={t => handleChange('pincode', t)} keyboardType="numeric" />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Address Type</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                {['Home', 'Office', 'Other'].map(type => (
                  <TouchableOpacity 
                    key={type}
                    style={[
                      styles.typeBadge, 
                      { borderColor: colors.border, backgroundColor: colors.backgroundElement },
                      formData.addressType === type && { borderColor: colors.primary, backgroundColor: colors.primary + '1A' }
                    ]}
                    onPress={() => handleChange('addressType', type)}
                  >
                    <Text style={{ color: formData.addressType === type ? colors.primary : colors.text }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.checkboxContainer, { marginTop: 8, marginBottom: 40 }]}
              onPress={() => handleChange('isDefault', !formData.isDefault)}
            >
              <View style={[styles.checkbox, { borderColor: formData.isDefault ? colors.primary : colors.textSecondary, backgroundColor: formData.isDefault ? colors.primary : 'transparent' }]}>
                {formData.isDefault && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={{ color: colors.text }}>Set as default address</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
  content: { padding: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
