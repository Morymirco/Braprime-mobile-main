import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Router, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface IconProps {
  size: number;
  color: string;
}

const MENU_ITEMS = [
  {
    id: 'orders',
    title: 'My Orders',
    icon: (props: IconProps) => <MaterialIcons name="receipt-long" {...props} />,
    onPress: (router: Router) => router.push('/orders'),
  },
  {
    id: 'favorites',
    title: 'My Favorites',
    icon: (props: IconProps) => <MaterialIcons name="favorite-outline" {...props} />,
  },
  {
    id: 'language',
    title: 'Language',
    icon: (props: IconProps) => <MaterialCommunityIcons name="translate" {...props} />,
    showArrow: true,
  },
  {
    id: 'chat',
    title: 'Chat with us',
    icon: (props: IconProps) => <Ionicons name="chatbubble-outline" {...props} />,
    showArrow: true,
  },
  {
    id: 'payment',
    title: 'Payment Methods',
    icon: (props: IconProps) => <MaterialIcons name="credit-card" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/payment/payment-methods'),
  },
  {
    id: 'map',
    title: 'Default map application',
    icon: (props: IconProps) => <MaterialCommunityIcons name="map-marker-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/map/default-map'),
  },
  {
    id: 'terms',
    title: 'Terms & Services',
    icon: (props: IconProps) => <MaterialIcons name="description" {...props} />,
    showArrow: true,
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: (props: IconProps) => <MaterialIcons name="lock-outline" {...props} />,
    showArrow: true,
  },
  {
    id: 'review',
    title: 'Give a Review',
    icon: (props: IconProps) => <MaterialIcons name="thumb-up-off-alt" {...props} />,
    showArrow: true,
    arrowIcon: 'chevron-right' as const,
  },
];

export default function ProfileScreen() {
  const router = useRouter();

  const handleEditName = () => {
    router.push('/profile/edit');
  };

  const handleWalletPress = () => {
    router.push('/wallet');
  };

  const handleMenuItemPress = (item: typeof MENU_ITEMS[0]) => {
    if (item.onPress) {
      item.onPress(router);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.userInfo} onPress={handleEditName}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80' }}
              style={styles.avatar}
            />
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>Ibrahim Diallo</Text>
              <Text style={styles.editText}>Edit</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#666" style={styles.editArrow} />
          </TouchableOpacity>

          {/* Wallet Card */}
          <TouchableOpacity style={styles.walletCard} onPress={handleWalletPress}>
            <View>
              <Text style={styles.walletLabel}>Wallet</Text>
              <View style={styles.walletAmount}>
                <Text style={styles.walletValue}>0</Text>
                <Text style={styles.walletCurrency}>CFA</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Existing Menu Items */}
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            style={[
              styles.menuItem,
              index !== MENU_ITEMS.length - 1 && styles.menuItemBorder
            ]}
            onPress={() => handleMenuItemPress(item)}
          >
            <View style={styles.menuItemLeft}>
              {item.icon({ size: 24, color: 'black' })}
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Feather 
              name={item.arrowIcon || 'chevron-right'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 0.1.0</Text>
          <Text style={styles.copyright}>© 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  editArrow: {
    marginLeft: 'auto',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  walletLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  walletAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  walletValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 4,
  },
  walletCurrency: {
    fontSize: 20,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#E31837',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 20,
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
  copyright: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 