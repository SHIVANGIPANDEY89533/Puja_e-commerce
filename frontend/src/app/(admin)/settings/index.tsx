import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Switch, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

export default function SettingsScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    storeName: '', storeLogo: '', contactEmail: '', phoneNumber: '', whatsappNumber: '',
    storeAddress: '', deliveryCharges: 0, freeDeliveryThreshold: 0, taxGst: 0, currency: 'INR',
    timeZone: 'Asia/Kolkata', razorpayEnabled: true, stripeEnabled: false, codEnabled: true,
    emailNotifications: true, pushNotifications: false, whatsappNotifications: false,
    theme: 'light', maintenanceMode: false, supportContact: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      alert('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      setSettings(res.data);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: 8 }} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );

  return (
    <ProtectedRoute adminOnly>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Store Settings</Text>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator size="small" color="#fff" /> : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Store Configuration */}
          <View style={[styles.section, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <SectionHeader title="Store Configuration" icon="storefront-outline" />
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Store Name</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={settings.storeName} onChangeText={(t) => updateSetting('storeName', t)} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Store Logo URL</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={settings.storeLogo} onChangeText={(t) => updateSetting('storeLogo', t)} />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Contact Email</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={settings.contactEmail} onChangeText={(t) => updateSetting('contactEmail', t)} keyboardType="email-address" />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={settings.phoneNumber} onChangeText={(t) => updateSetting('phoneNumber', t)} keyboardType="phone-pad" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>WhatsApp Number</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={settings.whatsappNumber} onChangeText={(t) => updateSetting('whatsappNumber', t)} keyboardType="phone-pad" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Store Address</Text>
              <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, height: 80 }]} value={settings.storeAddress} onChangeText={(t) => updateSetting('storeAddress', t)} multiline textAlignVertical="top" />
            </View>
          </View>

          {/* Business Settings */}
          <View style={[styles.section, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <SectionHeader title="Business Settings" icon="briefcase-outline" />
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Delivery Charges</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={String(settings.deliveryCharges)} onChangeText={(t) => updateSetting('deliveryCharges', Number(t))} keyboardType="numeric" />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Free Delivery Above</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={String(settings.freeDeliveryThreshold)} onChangeText={(t) => updateSetting('freeDeliveryThreshold', Number(t))} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Tax (GST %)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={String(settings.taxGst)} onChangeText={(t) => updateSetting('taxGst', Number(t))} keyboardType="numeric" />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Currency</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={settings.currency} onChangeText={(t) => updateSetting('currency', t)} />
              </View>
            </View>
          </View>

          {/* Payment & Application */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <SectionHeader title="Payment Gateway" icon="card-outline" />
              <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Razorpay</Text>
                <Switch value={settings.razorpayEnabled} onValueChange={(v) => updateSetting('razorpayEnabled', v)} />
              </View>
              <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Stripe</Text>
                <Switch value={settings.stripeEnabled} onValueChange={(v) => updateSetting('stripeEnabled', v)} />
              </View>
              <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Cash on Delivery</Text>
                <Switch value={settings.codEnabled} onValueChange={(v) => updateSetting('codEnabled', v)} />
              </View>
            </View>

            <View style={[styles.section, { flex: 1, marginLeft: 8, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <SectionHeader title="Application" icon="settings-outline" />
              <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Email Notifications</Text>
                <Switch value={settings.emailNotifications} onValueChange={(v) => updateSetting('emailNotifications', v)} />
              </View>
              <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Maintenance Mode</Text>
                <Switch value={settings.maintenanceMode} onValueChange={(v) => updateSetting('maintenanceMode', v)} />
              </View>
            </View>
          </View>
          
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  title: { fontSize: 24, fontWeight: 'bold' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }
});
