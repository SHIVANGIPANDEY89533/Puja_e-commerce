import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Guest trying to access protected route
      router.replace('/login');
    } else if (adminOnly && user.role?.toUpperCase() !== 'ADMIN') {
      // Normal user trying to access admin route
      router.replace('/'); 
    } else {
      setIsReady(true);
    }
  }, [user, isLoading, adminOnly]);

  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
