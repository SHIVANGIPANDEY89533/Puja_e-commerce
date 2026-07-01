import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from 'expo-router';
import api from '@/services/api';

export default function SignupScreen() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !mobile || !address || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/users/register', {
        name,
        email,
        mobile,
        address,
        password,
      });

      const userData = response.data;
      await login(userData);
      router.replace('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign up to get started</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
            placeholder="John Doe"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
            placeholder="john@example.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
            placeholder="9876543210"
            placeholderTextColor={colors.textSecondary}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
            placeholder="123 Street, City"
            placeholderTextColor={colors.textSecondary}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.signupBtn, { backgroundColor: colors.primary }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupBtnText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  signupBtn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
