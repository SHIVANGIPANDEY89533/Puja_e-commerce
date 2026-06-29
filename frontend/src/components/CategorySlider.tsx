import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { categoryService, Category } from '@/services/categoryService';

export default function CategorySlider() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.getCategories().then(data => {
      setCategories(data);
    }).catch(err => console.error("Failed to load categories", err));
  }, []);

  if (categories.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {categories.map((category) => (
          <TouchableOpacity key={category._id} style={styles.item}>
            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSelected }]}>
              {category.icon ? (
                <Image source={{ uri: category.icon }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{category.name.charAt(0)}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
