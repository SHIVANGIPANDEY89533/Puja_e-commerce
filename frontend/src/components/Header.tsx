import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { addressService, Address } from '@/services/addressService';

export default function Header() {
  const { scheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [defaultAddress, setDefaultAddress] = React.useState<Address | null>(null);
  const [allAddresses, setAllAddresses] = React.useState<Address[]>([]);
  const [isAddressDropdownVisible, setAddressDropdownVisible] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      addressService.getMyAddresses().then(addrs => {
        setAllAddresses(addrs);
        const def = addrs.find(a => a.isDefault) || addrs[0];
        setDefaultAddress(def || null);
      }).catch(err => console.log('Header address err', err));
    } else {
      setAllAddresses([]);
      setDefaultAddress(null);
    }
  }, [user, pathname]); // Re-fetch when route changes (e.g. back from adding an address)

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <View style={[styles.content, { zIndex: 50 }]}>
        <View style={{ position: 'relative', flex: 1, zIndex: 50 }}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={() => {
              if (allAddresses.length > 1) {
                setAddressDropdownVisible(!isAddressDropdownVisible);
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="location-sharp" size={20} color={colors.primary} />
            <View style={styles.textContainer}>
              <Text style={[styles.deliverTo, { color: colors.textSecondary }]}>Deliver to</Text>
              <Text style={[styles.address, { color: colors.text }]} numberOfLines={1}>
                {defaultAddress ? `${defaultAddress.city} ${defaultAddress.pincode}` : 'Select Address'}
              </Text>
            </View>
            {allAddresses.length > 1 && (
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {isAddressDropdownVisible && allAddresses.length > 1 && (
            <View style={[styles.addressDropdown, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              {allAddresses.map(addr => (
                <TouchableOpacity 
                  key={addr._id} 
                  style={[styles.addressDropdownItem, defaultAddress?._id === addr._id && { backgroundColor: colors.primary + '15' }]} 
                  onPress={() => { setDefaultAddress(addr); setAddressDropdownVisible(false); }}
                >
                  <Text style={[styles.addressDropdownItemText, { color: defaultAddress?._id === addr._id ? colors.primary : colors.text }]} numberOfLines={1}>
                    {addr.flat ? addr.flat + ', ' : ''}{addr.area}, {addr.city}
                  </Text>
                  {defaultAddress?._id === addr._id && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.iconButton}>
            <Ionicons name="cart-outline" size={22} color={colors.text} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Ionicons name={scheme === 'dark' ? "sunny" : "moon"} size={20} color={colors.text} />
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.authButtons}>
              <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginBtn}>
                <Text style={[styles.loginText, { color: colors.text }]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/signup')} style={[styles.signupBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 48, 
    paddingBottom: 8,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 8,
    marginRight: 4,
  },
  deliverTo: {
    fontSize: 12,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    fontWeight: '700',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeToggle: {
    padding: 2,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  loginText: {
    fontWeight: '600',
    fontSize: 13,
  },
  signupBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  signupText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  profileBtn: {
    marginLeft: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -4,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressDropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    width: 260,
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    zIndex: 100,
  },
  addressDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  addressDropdownItemText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
});
