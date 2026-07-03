import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

// Native speech recognition is excluded on web

export default function SearchBar({ onSearch }: { onSearch?: (query: string) => void }) {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const [searchText, setSearchText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleMicPress = () => {
    alert("Voice search is only available on the mobile app.");
  };

  const handleSubmit = () => {
    if (onSearch) {
      onSearch(searchText);
    } else if (searchText.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchText)}`);
    }
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    // If the user completely clears the search bar, instantly tell the parent to clear results
    if (text.trim() === '' && onSearch) {
      onSearch('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <View style={[styles.searchBox, { backgroundColor: scheme === 'dark' ? '#333' : '#F0F0F0' }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.icon} />
        <TextInput
          placeholder={isListening ? "Listening... Speak now!" : "Search for Puja Samagri, Murtis, and more..."}
          placeholderTextColor={isListening ? colors.primary : colors.textSecondary}
          style={[styles.input, { color: colors.text, fontWeight: isListening ? 'bold' : 'normal' }]}
          value={searchText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleMicPress}>
          {isListening ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.icon} />
          ) : (
            <Ionicons name="mic" size={20} color={colors.primary} style={styles.icon} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  icon: {
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
});
