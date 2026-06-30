import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

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
  orderId,
  amount,
  currency,
  publicKey,
  userEmail,
  userPhone,
  onSuccess,
  onError,
  onCancel
}: RazorpayCheckoutProps) {
  
  // For Expo Web: Inject Razorpay Checkout script dynamically
  useEffect(() => {
    const loadRazorpay = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (!window.Razorpay) {
          onError('Razorpay SDK failed to load');
          return;
        }
        const options = {
          key: publicKey,
          currency: currency,
          name: 'Puja Samagri Store',
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
            color: '#FB641B'
          },
          modal: {
            ondismiss: function() {
              onCancel();
            }
          }
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          onError(response.error);
        });
        rzp.open();
      };
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#FB641B" />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});
