import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SupportCenterScreen() {
  const router = useRouter();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const menuItems = [
    {
      title: 'Chat with AI Assistant',
      description: 'Get instant answers to common questions',
      icon: 'chatbubbles',
      color: '#3498DB',
      route: '/support/ai-chat'
    },
    {
      title: 'Raise Support Ticket',
      description: 'Report an issue to our admin team',
      icon: 'ticket',
      color: '#E67E22',
      route: '/support/create'
    },
    {
      title: 'My Tickets',
      description: 'View and reply to your active tickets',
      icon: 'folder-open',
      color: '#9B59B6',
      route: '/support/my-tickets'
    }
  ];

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>How can we help you today?</Text>
          
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  {/* @ts-ignore */}
                  <Ionicons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>Frequently Asked Questions</Text>
          
          <View style={[styles.faqCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>Where is my order?</Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>You can track your order status in the "My Orders" section of your profile.</Text>
          </View>
          <View style={[styles.faqCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I return an item?</Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>You can raise a support ticket and select "Return" as the category. Please attach a photo if applicable.</Text>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  menuGrid: { gap: 12 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48, height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 13 },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  faqQuestion: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  faqAnswer: { fontSize: 14, lineHeight: 20 }
});
