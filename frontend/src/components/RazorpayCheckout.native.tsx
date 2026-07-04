import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
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
  
  const webviewRef = useRef<WebView>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: ${colors.background}; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid ${colors.primary}; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="loader"></div>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <script>
        var options = {
          key: "${publicKey}",
          amount: "${amount}",
          currency: "${currency}",
          name: "Puja Samagri",
          description: "Order Payment",
          order_id: "${orderId}",
          handler: function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              status: 'success', 
              paymentId: response.razorpay_payment_id, 
              signature: response.razorpay_signature 
            }));
          },
          prefill: {
            email: "${userEmail}",
            contact: "${userPhone}"
          },
          theme: {
            color: "${colors.primary}"
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancel' }));
            }
          }
        };

        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            status: 'error', 
            error: response.error.description 
          }));
        });
        
        // Wait slightly to ensure rendering, then open
        setTimeout(() => {
          rzp.open();
        }, 500);
      </script>
    </body>
    </html>
  `;

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === 'success') {
        onSuccess(data.paymentId, data.signature);
      } else if (data.status === 'cancel') {
        onCancel();
      } else if (data.status === 'error') {
        onError(new Error(data.error || 'Payment failed'));
      }
    } catch (err) {
      onError(err);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
