import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ticketService } from '@/services/ticketService';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ChatMessage {
  id: string;
  sender: 'AI' | 'User';
  text: string;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const sessionId = 'main-session';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await ticketService.getAIChatHistory(sessionId);
      if (history && history.messages && history.messages.length > 0) {
        const mapped = history.messages.map((m: any) => ({
          id: m._id || Math.random().toString(),
          sender: m.sender,
          text: m.message
        }));
        setMessages(mapped);
      } else {
        setMessages([{ id: 'welcome', sender: 'AI', text: 'Hi! I am your AI Support Assistant. How can I help you today?' }]);
      }
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (error) {
      setMessages([{ id: 'welcome', sender: 'AI', text: 'Hi! I am your AI Support Assistant. How can I help you today?' }]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'User', text: inputText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await ticketService.chatWithAI(userMsg.text, sessionId);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'AI', text: response.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'AI', text: 'Sorry, I am having trouble connecting to the server. Please create a support ticket.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const escalateToTicket = () => {
    // Pass the sessionId to link the conversation
    router.push({
      pathname: '/support/create',
      params: { aiSessionId: sessionId }
    });
  };

  return (
    <ProtectedRoute>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="hardware-chip" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'User';
            return (
              <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
                {!isUser && (
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Ionicons name="hardware-chip" size={14} color="#fff" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble, 
                  isUser ? { backgroundColor: colors.primary } : { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.border }
                ]}>
                  <Text style={[styles.messageText, { color: isUser ? '#fff' : colors.text }]}>{msg.text}</Text>
                </View>
              </View>
            );
          })}
          {isTyping && (
            <View style={[styles.messageWrapper, styles.aiWrapper]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="hardware-chip" size={14} color="#fff" />
              </View>
              <View style={[styles.messageBubble, { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.border, paddingVertical: 12 }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.escalateContainer, { backgroundColor: colors.backgroundElement, borderTopColor: colors.border }]}>
          <Text style={[styles.escalateText, { color: colors.textSecondary }]}>Can't find what you need?</Text>
          <TouchableOpacity style={styles.escalateBtn} onPress={escalateToTicket}>
            <Text style={styles.escalateBtnText}>Create Support Ticket</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.backgroundElement, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
            placeholder="Type your message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons name="send" size={18} color="#fff" />
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
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold' },
  chatArea: { flex: 1 },
  messageWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  messageText: { fontSize: 15, lineHeight: 22 },
  escalateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  escalateText: { fontSize: 13 },
  escalateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  escalateBtnText: { color: '#3498DB', fontWeight: 'bold', fontSize: 14 },
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
    maxHeight: 100,
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
