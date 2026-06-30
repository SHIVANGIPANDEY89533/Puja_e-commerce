import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsScreen() {
  const { scheme, toggleTheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [notifications, setNotifications] = React.useState(true);
  const [emails, setEmails] = React.useState(true);

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>PREFERENCES</Text>
          
          <View style={[styles.settingBlock, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={24} color={colors.text} style={styles.icon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch 
                value={scheme === 'dark'} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: colors.primary + '80' }}
                thumbColor={scheme === 'dark' ? colors.primary : '#f4f3f4'}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={24} color={colors.text} style={styles.icon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Push Notifications</Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={setNotifications}
                trackColor={{ false: '#767577', true: colors.primary + '80' }}
                thumbColor={notifications ? colors.primary : '#f4f3f4'}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail" size={24} color={colors.text} style={styles.icon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Email Updates</Text>
              </View>
              <Switch 
                value={emails} 
                onValueChange={setEmails}
                trackColor={{ false: '#767577', true: colors.primary + '80' }}
                thumbColor={emails ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 24 }]}>ACCOUNT</Text>
          
          <View style={[styles.settingBlock, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="lock-closed" size={24} color={colors.text} style={styles.icon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="trash" size={24} color="red" style={styles.icon} />
                <Text style={[styles.settingText, { color: 'red' }]}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, marginLeft: 8 },
  settingBlock: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { marginRight: 16 },
  settingText: { fontSize: 16 },
  divider: { height: 1, width: '100%' }
});
