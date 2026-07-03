import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ticketService, Ticket } from '@/services/ticketService';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminTicketDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

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

  const updateStatus = async (status: string) => {
    try {
      const updatedTicket = await ticketService.updateTicketStatus(id, { status });
      setTicket(updatedTicket);
      setShowStatusMenu(false);
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return '#3498DB';
      case 'In Progress': return '#F39C12';
      case 'Waiting for Customer': return '#E67E22';
      case 'Resolved': return '#2ECC71';
      case 'Closed': return '#7F8C8D';
      default: return colors.textSecondary;
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
    <ProtectedRoute adminOnly>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>Ticket #{ticket._id.substring(0, 6)}</Text>
          
          <TouchableOpacity onPress={() => setShowStatusMenu(!showStatusMenu)}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '22' }]}>
              <Text style={{ color: getStatusColor(ticket.status), fontSize: 12, fontWeight: 'bold' }}>{ticket.status}</Text>
              <Ionicons name="chevron-down" size={14} color={getStatusColor(ticket.status)} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        </View>

        {showStatusMenu && (
          <View style={[styles.statusMenu, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {(['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed']).map(s => (
              <TouchableOpacity key={s} style={styles.statusMenuItem} onPress={() => updateStatus(s)}>
                <Text style={{ color: colors.text, fontWeight: ticket.status === s ? 'bold' : 'normal' }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.ticketInfo, { borderBottomColor: colors.border, backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.subject, { color: colors.text }]}>{ticket.subject}</Text>
          <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
            From: {ticket.user?.name} ({ticket.user?.email})
          </Text>
          
          {ticket.relatedOrder && (
            <TouchableOpacity 
              style={[styles.orderBox, { backgroundColor: colors.primary + '11', borderColor: colors.primary }]}
              onPress={() => router.push(`/(admin)/orders/${ticket.relatedOrder._id}` as any)}
            >
              <Ionicons name="cart" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, marginLeft: 8, fontWeight: 'bold' }}>
                Related Order: #{ticket.relatedOrder._id.substring(0, 6)}
              </Text>
              <Text style={{ color: colors.primary, marginLeft: 'auto' }}>View Order ➔</Text>
            </TouchableOpacity>
          )}

          <View style={styles.metaRow}>
            <Text style={[styles.category, { color: colors.textSecondary }]}>{ticket.category}</Text>
            <Text style={[styles.priority, { color: colors.textSecondary }]}>Priority: {ticket.priority}</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {ticket.aiChatHistory && ticket.aiChatHistory.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, opacity: 0.7 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text style={{ marginHorizontal: 8, fontSize: 12, color: colors.textSecondary }}>Previous AI Conversation</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>

              {ticket.aiChatHistory.map((msg, index) => {
                const isUser = msg.sender === 'User';
                return (
                  <View key={`ai-${index}`} style={[styles.messageWrapper, !isUser ? styles.userWrapper : styles.adminWrapper]}>
                    {!isUser && (
                      <View style={[styles.avatar, { backgroundColor: '#9B59B6' }]}>
                        <Ionicons name="hardware-chip" size={14} color="#fff" />
                      </View>
                    )}
                    <View style={[
                      styles.messageBubble, 
                      isUser ? { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.border } : { backgroundColor: 'rgba(155, 89, 182, 0.1)', borderWidth: 1, borderColor: '#9B59B6' }
                    ]}>
                      <Text style={[styles.messageText, { color: colors.text }]}>{msg.message}</Text>
                    </View>
                  </View>
                );
              })}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 24, opacity: 0.7 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text style={{ marginHorizontal: 8, fontSize: 12, color: colors.textSecondary }}>Ticket Escalated Here</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
            </View>
          )}

          {ticket.messages.map((msg, index) => {
            const isAdmin = msg.senderType === 'Admin';
            const isAI = msg.senderType === 'AI';
            
            return (
              <View key={msg._id || index} style={[styles.messageWrapper, isAdmin ? styles.adminWrapper : styles.userWrapper]}>
                {!isAdmin && (
                  <View style={[styles.avatar, { backgroundColor: isAI ? '#9B59B6' : colors.textSecondary }]}>
                    <Ionicons name={isAI ? 'hardware-chip' : 'person'} size={14} color="#fff" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble, 
                  isAdmin ? { backgroundColor: colors.primary } : { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.border }
                ]}>
                  {isAdmin && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginBottom: 2 }}>You (Admin)</Text>}
                  <Text style={[styles.messageText, { color: isAdmin ? '#fff' : colors.text }]}>{msg.message}</Text>
                  {msg.createdAt && (
                    <Text style={[styles.timeText, { color: isAdmin ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.backgroundElement, borderTopColor: colors.border, paddingBottom: Math.max(12, insets.bottom) }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
            placeholder="Type your reply to customer..."
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
    zIndex: 10
  },
  backBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 180,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  ticketInfo: { padding: 16, borderBottomWidth: 1 },
  subject: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  customerInfo: { fontSize: 14, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 16 },
  category: { fontSize: 13, fontWeight: '500' },
  priority: { fontSize: 13, fontWeight: '500' },
  orderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  chatArea: { flex: 1 },
  messageWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userWrapper: { justifyContent: 'flex-start' },
  adminWrapper: { justifyContent: 'flex-end' },
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
