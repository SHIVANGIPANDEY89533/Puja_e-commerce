import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ticketService, TicketMessage } from '@/services/ticketService';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CreateTicketScreen() {
  const router = useRouter();
  const { context } = useLocalSearchParams<{ context: string }>();
  
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Order Issue', 'Payment Issue', 'Refund', 'Return', 
    'Product Issue', 'Account Issue', 'Delivery Issue', 
    'Technical Problem', 'General Inquiry'
  ];

  useEffect(() => {
    if (context) {
      setDescription(`[AI Conversation History]\n${context}\n\n[Additional Details]\n`);
      
      // Basic auto-categorization
      const lowerContext = context.toLowerCase();
      if (lowerContext.includes('order')) setCategory('Order Issue');
      else if (lowerContext.includes('delivery')) setCategory('Delivery Issue');
      else if (lowerContext.includes('refund')) setCategory('Refund');
      else if (lowerContext.includes('payment')) setCategory('Payment Issue');
    }
  }, [context]);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      alert('Subject and Description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const initialMessages: TicketMessage[] = [
        { senderType: 'Customer', message: description }
      ];

      await ticketService.createTicket({
        subject,
        category,
        description,
        priority,
        messages: initialMessages
      });

      alert('Ticket created successfully!');
      router.replace('/support/my-tickets');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Create Support Ticket</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Subject *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
            placeholder="Briefly describe your issue"
            placeholderTextColor={colors.textSecondary}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  { borderColor: colors.border, backgroundColor: category === cat ? colors.primary : colors.backgroundElement }
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={{ color: category === cat ? '#fff' : colors.text, fontSize: 13 }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
          <View style={styles.categoryGrid}>
            {(['Low', 'Medium', 'High', 'Urgent'] as const).map((pri) => (
              <TouchableOpacity
                key={pri}
                style={[
                  styles.categoryPill,
                  { borderColor: colors.border, backgroundColor: priority === pri ? colors.primary : colors.backgroundElement }
                ]}
                onPress={() => setPriority(pri)}
              >
                <Text style={{ color: priority === pri ? '#fff' : colors.text, fontSize: 13 }}>{pri}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
            placeholder="Please provide details about your issue..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Ticket</Text>
            )}
          </TouchableOpacity>
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
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold' },
  formContainer: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 120
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1
  },
  submitBtn: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
