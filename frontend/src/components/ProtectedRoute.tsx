import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (user && adminOnly && user.role?.toUpperCase() !== 'ADMIN') {
      // Normal user trying to access admin route
      router.replace('/'); 
    } else {
      setIsReady(true);
    }
  }, [user, isLoading, adminOnly]);

  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: colors.backgroundElement, padding: 32, borderRadius: 20, alignItems: 'center', width: '100%', maxWidth: 400, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.primary} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16, color: colors.text }}>Login Required</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 8, marginBottom: 24, fontSize: 16 }}>
            You need to be logged in to access this page.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }}
            onPress={() => router.push('/login')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Login to Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}
