import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Router, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileSkeleton from '../../components/ProfileSkeleton';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../lib/contexts/AuthContext';

interface IconProps {
  size: number;
  color: string;
}

const MENU_ITEMS = [
  {
    id: 'orders',
    title: 'Mes Commandes',
    icon: (props: IconProps) => <MaterialIcons name="receipt-long" {...props} />,
    onPress: (router: Router) => router.push('/orders'),
  },
  {
    id: 'reservations',
    title: 'Mes Réservations',
    icon: (props: IconProps) => <MaterialIcons name="event-available" {...props} />,
    onPress: (router: Router) => router.push('/reservations'),
  },
  {
    id: 'favorites',
    title: 'Mes Favoris',
    icon: (props: IconProps) => <MaterialIcons name="favorite-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/favorites'),
  },
  {
    id: 'language',
    title: 'Langue',
    icon: (props: IconProps) => <MaterialCommunityIcons name="translate" {...props} />,
    showArrow: true,
  },
  {
    id: 'chat',
    title: 'Discuter avec nous',
    icon: (props: IconProps) => <Ionicons name="chatbubble-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/chat'),
  },
  {
    id: 'map',
    title: 'Application de carte par défaut',
    icon: (props: IconProps) => <MaterialCommunityIcons name="map-marker-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/map/default-map'),
  },
  {
    id: 'terms',
    title: 'Conditions et services',
    icon: (props: IconProps) => <MaterialIcons name="description" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/terms'),
  },
  {
    id: 'privacy',
    title: 'Politique de confidentialité',
    icon: (props: IconProps) => <MaterialIcons name="lock-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/privacy'),
  },
  {
    id: 'review',
    title: 'Donner un avis',
    icon: (props: IconProps) => <MaterialIcons name="thumb-up-off-alt" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/app-review'),
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, loading, error } = useProfile();

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

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Compte</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.userInfo} onPress={handleEditName}>
            <Image 
              source={{ 
                uri: profile?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=random&size=100`
              }}
              style={styles.avatar}
            />
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>
                {profile?.name || 'Nom non défini'}
              </Text>
              <Text style={styles.editText}>Modifier</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#666" style={styles.editArrow} />
          </TouchableOpacity>

          {/* Wallet Card */}
          <TouchableOpacity style={styles.walletCard} onPress={handleWalletPress}>
            <View>
              <Text style={styles.walletLabel}>Portefeuille</Text>
              <View style={styles.walletAmount}>
                <Text style={styles.walletValue}>0</Text>
                <Text style={styles.walletCurrency}>CFA</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Existing Menu Items */}
        <View style={styles.menuContainer}>
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
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E31837',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  walletCurrency: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
    color: '#000',
  },
  logoutButton: {
    backgroundColor: '#E31837',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
}); 