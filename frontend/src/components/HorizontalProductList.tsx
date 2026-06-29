import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import SectionHeader from './SectionHeader';
import ProductCard from './ProductCard';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface HorizontalProductListProps {
  title: string;
  data: any[];
  onPressViewMore?: () => void;
}

export default function HorizontalProductList({ title, data, onPressViewMore }: HorizontalProductListProps) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <SectionHeader title={title} onPressViewMore={onPressViewMore} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
