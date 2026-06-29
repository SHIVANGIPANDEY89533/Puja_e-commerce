import { Stack } from 'react-router';
import { Stack as ExpoStack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export default function ProductsLayout() {
  const { scheme } = useTheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ExpoStack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundElement,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <ExpoStack.Screen 
        name="index" 
        options={{ 
          title: 'Manage Products',
          headerShown: false // Parent tab already has a header, or we can use this one
        }} 
      />
      <ExpoStack.Screen 
        name="add" 
        options={{ 
          title: 'Add New Product',
          presentation: 'modal'
        }} 
      />
      <ExpoStack.Screen 
        name="[id]" 
        options={{ 
          title: 'Edit Product',
          presentation: 'modal'
        }} 
      />
    </ExpoStack>
  );
}
