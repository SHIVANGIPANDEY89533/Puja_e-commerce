import { Stack as ExpoStack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export default function OrdersLayout() {
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
          title: 'Manage Orders',
          headerShown: false
        }} 
      />
      <ExpoStack.Screen 
        name="[id]" 
        options={{ 
          title: 'Order Details',
          presentation: 'modal'
        }} 
      />
    </ExpoStack>
  );
}
