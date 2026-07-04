import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number;
  currency: string;
  publicKey: string;
  userEmail: string;
  userPhone: string;
  onSuccess: (paymentId: string, signature: string) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export default function RazorpayCheckout({
  orderId, amount, currency, publicKey, userEmail, userPhone, onSuccess, onError, onCancel
}: RazorpayCheckoutProps) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const scriptLoaded = useRef(false);
  const rzpInstance = useRef<any>(null);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (!(window as any).Razorpay) {
        onError(new Error('Razorpay SDK failed to load'));
        return;
      }

      const options = {
        key: publicKey,
        amount: amount.toString(),
        currency: currency,
        name: 'Puja Samagri',
        description: 'Order Payment',
        order_id: orderId,
        handler: function (response: any) {
          onSuccess(response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          email: userEmail,
          contact: userPhone
        },
        theme: {
          color: colors.primary
        },
        modal: {
          ondismiss: function() {
            onCancel();
          }
        }
      };

      rzpInstance.current = new (window as any).Razorpay(options);
      rzpInstance.current.on('payment.failed', function (response: any) {
        onError(response.error);
      });
      rzpInstance.current.open();
    };
    
    script.onerror = () => {
      onError(new Error('Failed to load Razorpay SDK'));
    };

    document.body.appendChild(script);

    return () => {
      if (rzpInstance.current) {
        // Try to close modal if unmounted
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>Securely opening Razorpay...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  text: {
    marginTop: 16,
    fontSize: 16
  }
});
