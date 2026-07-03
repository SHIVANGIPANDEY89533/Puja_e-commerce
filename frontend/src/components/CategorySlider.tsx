import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { categoryService, Category } from '@/services/categoryService';
import { Link, useRouter } from 'expo-router';
import { setGlobalCategory } from '@/services/productService';

interface CategorySliderProps {
  onSelectCategory?: (id: string) => void;
  selectedCategoryId?: string | null;
}

export default function CategorySlider({ onSelectCategory, selectedCategoryId }: CategorySliderProps = {}) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
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
        {categories.map((category) => {
          const content = (
            <TouchableOpacity 
              style={styles.item}
              onPress={() => {
                if (onSelectCategory) {
                  onSelectCategory(category._id);
                } else {
                  setGlobalCategory(category._id);
                }
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: selectedCategoryId === category._id ? colors.primary + '33' : colors.backgroundSelected }]}>
                {category.icon ? (
                  <Image source={{ uri: category.icon }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: selectedCategoryId === category._id ? colors.primary : colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{category.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.name, { color: selectedCategoryId === category._id ? colors.primary : colors.text }]} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
          
          if (onSelectCategory) {
            return <React.Fragment key={category._id}>{content}</React.Fragment>;
          }

          return (
            <Link href="/categories" asChild key={category._id}>
              {content}
            </Link>
          );
        })}
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
