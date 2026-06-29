import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ticketService, Ticket } from '@/services/ticketService';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TicketDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getTicketById(id);
      setTicket(data);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load ticket details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);

    try {
      const updatedTicket = await ticketService.addMessage(id, replyText);
      setTicket(updatedTicket);
      setReplyText('');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const closeTicket = async () => {
    if (confirm('Are you sure you want to close this ticket?')) {
      try {
        const updatedTicket = await ticketService.updateTicketStatus(id, { status: 'Closed' });
        setTicket(updatedTicket);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to close ticket');
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ticket) return null;

  return (
    <ProtectedRoute>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>#{ticket._id.substring(0, 6)}</Text>
          {ticket.status !== 'Closed' && (
            <TouchableOpacity onPress={closeTicket}>
              <Text style={{ color: '#E74C3C', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          )}
          {ticket.status === 'Closed' && <View style={{ width: 40 }} />}
        </View>

        <View style={[styles.ticketInfo, { borderBottomColor: colors.border, backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.subject, { color: colors.text }]}>{ticket.subject}</Text>
          <Text style={[styles.category, { color: colors.textSecondary }]}>{ticket.category} • {ticket.status}</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {ticket.messages.map((msg, index) => {
            const isUser = msg.senderType === 'Customer';
            return (
              <View key={msg._id || index} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.adminWrapper]}>
                {!isUser && (
                  <View style={[styles.avatar, { backgroundColor: msg.senderType === 'AI' ? '#9B59B6' : colors.primary }]}>
                    <Ionicons name={msg.senderType === 'AI' ? 'hardware-chip' : 'headset'} size={14} color="#fff" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble, 
                  isUser ? { backgroundColor: colors.primary } : { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.border }
                ]}>
                  <Text style={[styles.messageText, { color: isUser ? '#fff' : colors.text }]}>{msg.message}</Text>
                  {msg.createdAt && (
                    <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {ticket.status !== 'Closed' ? (
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundElement, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Type your reply..."
              placeholderTextColor={colors.textSecondary}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: replyText.trim() ? colors.primary : colors.border }]} 
              onPress={sendReply}
              disabled={!replyText.trim() || isSending}
            >
              {isSending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundElement, borderTopColor: colors.border, justifyContent: 'center', paddingVertical: 16 }]}>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>This ticket is closed.</Text>
          </View>
        )}
      </KeyboardAvoidingView>
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
  title: { fontSize: 16, fontWeight: 'bold' },
  ticketInfo: { padding: 16, borderBottomWidth: 1 },
  subject: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  category: { fontSize: 13 },
  chatArea: { flex: 1 },
  messageWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userWrapper: { justifyContent: 'flex-end' },
  adminWrapper: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  messageText: { fontSize: 15, lineHeight: 22 },
  timeText: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  }
});
