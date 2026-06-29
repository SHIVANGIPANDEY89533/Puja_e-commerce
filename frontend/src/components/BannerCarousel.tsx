import React, { useRef, useEffect, useState } from 'react';
import { View, Text, FlatList, ImageBackground, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { bannerService, Banner } from '@/services/bannerService';

export default function BannerCarousel() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const { width } = useWindowDimensions(); 
  
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    bannerService.getBanners('Home').then(data => {
      setBanners(data);
    }).catch(err => console.error("Failed to load banners", err));
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const intervalId = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= banners.length) {
        nextIndex = 0;
      }
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [currentIndex, width, banners]);

  const renderItem = ({ item }: { item: Banner }) => (
    <View style={[styles.imageContainer, { width }]}>
      <ImageBackground 
        source={{ uri: item.image }} 
        style={styles.imageBg} 
        imageStyle={{ borderRadius: 12, opacity: 0.8 }}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {!!item.redirectUrl && <Text style={styles.subtitle} numberOfLines={1}>Tap to learn more</Text>}
        </View>
      </ImageBackground>
    </View>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <FlatList 
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  imageContainer: {
    // Width is dynamically applied inline to handle responsiveness
    paddingHorizontal: 16, 
    height: 160,
  },
  imageBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
});
