import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Link } from 'expo-router';

interface SectionHeaderProps {
  title: string;
  onPressViewMore?: () => void;
  href?: any;
}

export default function SectionHeader({ title, onPressViewMore, href }: SectionHeaderProps) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const button = (
    <TouchableOpacity style={StyleSheet.flatten([styles.button, { backgroundColor: colors.primary }])} onPress={onPressViewMore}>
      <Text style={styles.buttonText}>View More</Text>
      <Ionicons name="chevron-forward" size={14} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {href ? (
        <Link href={href} asChild>
          {button}
        </Link>
      ) : button}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
});
