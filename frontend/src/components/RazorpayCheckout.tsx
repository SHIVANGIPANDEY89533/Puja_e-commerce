import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

export default function RazorpayCheckout(props: RazorpayCheckoutProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Native Razorpay requires react-native-webview which is incompatible with the current Metro Web bundler configuration.
      </Text>
      <Text style={styles.text}>
        Please run the app in the Web Browser (press 'w' in terminal) to test the payment flow.
      </Text>
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
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16
  }
});
