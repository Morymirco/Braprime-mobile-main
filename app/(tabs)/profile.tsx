import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Router, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileSkeleton from '../../components/ProfileSkeleton';
import { useProfile } from '../../hooks/useProfile';
import { useUserStats } from '../../hooks/useUserStats';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useI18n } from '../../lib/contexts/I18nContext';

interface IconProps {
  size: number;
  color: string;
}

// Fonction pour créer les éléments de menu avec traductions
const createMenuItems = (t: (key: string) => string, currentLanguage: string) => [
  {
    id: 'orders',
    title: t('profile.myOrders'),
    icon: (props: IconProps) => <MaterialIcons name="receipt-long" {...props} />,
    onPress: (router: Router) => router.push('/orders'),
  },
  {
    id: 'package-orders',
    title: t('profile.myPackages'),
    icon: (props: IconProps) => <MaterialIcons name="inventory" {...props} />,
    onPress: (router: Router) => router.push('/package-orders'),
  },
  {
    id: 'reservations',
    title: t('profile.myReservations'),
    icon: (props: IconProps) => <MaterialIcons name="event-available" {...props} />,
    onPress: (router: Router) => router.push('/reservations'),
  },
  {
    id: 'favorites',
    title: t('profile.myFavorites'),
    icon: (props: IconProps) => <MaterialIcons name="favorite-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/favorites'),
  },
  {
    id: 'settings',
    title: t('profile.settings'),
    icon: (props: IconProps) => <Ionicons name="settings-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/profile/settings'),
  },
  {
    id: 'language',
    title: `${t('profile.language')} (${currentLanguage === 'fr' ? '🇫🇷 Français' : currentLanguage === 'en' ? '🇺🇸 English' : '🇸🇦 العربية'})`,
    icon: (props: IconProps) => <MaterialCommunityIcons name="translate" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/profile/language'),
  },
  {
    id: 'chat',
    title: t('profile.chat'),
    icon: (props: IconProps) => <Ionicons name="chatbubble-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/chat'),
  },
  {
    id: 'terms',
    title: t('profile.terms'),
    icon: (props: IconProps) => <MaterialIcons name="description" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/terms'),
  },
  {
    id: 'privacy',
    title: t('profile.privacy'),
    icon: (props: IconProps) => <MaterialIcons name="lock-outline" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/privacy'),
  },
  {
    id: 'review',
    title: t('profile.reviewApp'),
    icon: (props: IconProps) => <MaterialIcons name="thumb-up-off-alt" {...props} />,
    showArrow: true,
    onPress: (router: Router) => router.push('/app-review'),
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, loading, error, refetch } = useProfile();
  const { t, language } = useI18n();
  
  // Utiliser le hook pour les statistiques
  const { stats, loading: statsLoading, error: statsError, forceRefresh } = useUserStats(profile?.id);
  
  // État pour le pull-to-refresh
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Créer les éléments de menu avec traductions
  const MENU_ITEMS = createMenuItems(t, language);

  const handleEditName = () => {
    router.push('/profile/edit');
  };

  const handleMenuItemPress = (item: typeof MENU_ITEMS[0]) => {
    if (item.onPress) {
      item.onPress(router);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Rafraîchir le profil et les statistiques
      await Promise.all([
        refetch(),
        forceRefresh()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('auth.logoutCancel'), style: 'cancel' },
        {
          text: t('auth.logoutAction'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Ne pas faire de navigation manuelle ici
              // AuthGuard gérera automatiquement la redirection vers /login
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert(t('common.error'), t('auth.logoutError') || 'Erreur lors de la déconnexion');
            }
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
          <Text style={styles.errorText}>{t('common.error')}: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/profile/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E31837']} // Android
            tintColor="#E31837" // iOS
            title={t('common.loading')} // iOS
            titleColor="#666" // iOS
          />
        }
      >
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
                {profile?.name || t('profile.nameUndefined')}
              </Text>
              <Text style={styles.userEmail}>
                {profile?.email || t('profile.emailUndefined')}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#666" style={styles.editArrow} />
          </TouchableOpacity>

          {/* Statistiques utilisateur */}
          <View style={styles.statsHeader}>
            <View style={styles.statsTitleContainer}>
              <Text style={styles.statsTitle}>{t('profile.stats')}</Text>
              {statsLoading && (
                <Text style={styles.statsSubtitle}>{t('common.loading')}</Text>
              )}
              {statsError && (
                <Text style={styles.statsError}>{t('common.error')}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={[
                styles.refreshButton,
                statsLoading && styles.refreshButtonLoading
              ]} 
              onPress={forceRefresh}
              disabled={statsLoading}
            >
              <MaterialIcons 
                name="refresh" 
                size={20} 
                color={statsLoading ? "#ccc" : "#E31837"} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="receipt-long" size={24} color="#E31837" />
              <View style={styles.statContent}>
                {statsLoading ? (
                  <View style={styles.statLoading}>
                    <ActivityIndicator size="small" color="#E31837" />
                  </View>
                ) : (
                  <Text style={styles.statValue}>{stats.orders}</Text>
                )}
                <Text style={styles.statLabel}>{t('profile.orders')}</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="inventory" size={24} color="#2196F3" />
              <View style={styles.statContent}>
                {statsLoading ? (
                  <View style={styles.statLoading}>
                    <ActivityIndicator size="small" color="#2196F3" />
                  </View>
                ) : (
                  <Text style={styles.statValue}>{stats.packages}</Text>
                )}
                <Text style={styles.statLabel}>{t('profile.packages')}</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="event-available" size={24} color="#4CAF50" />
              <View style={styles.statContent}>
                {statsLoading ? (
                  <View style={styles.statLoading}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                  </View>
                ) : (
                  <Text style={styles.statValue}>{stats.reservations}</Text>
                )}
                <Text style={styles.statLabel}>{t('profile.reservations')}</Text>
              </View>
            </View>
          </View>
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
                {item.icon({ size: 24, color: '#333' })}
                <View style={styles.menuItemTexts}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
              </View>
              <Feather 
                name="chevron-right" 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
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
    fontSize: 28,
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
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    flexShrink: 0,
  },
  userNameContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: 8,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'left',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'left',
  },
  editArrow: {
    marginLeft: 'auto',
    flexShrink: 0,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsTitleContainer: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsError: {
    fontSize: 12,
    color: '#E31837',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  refreshButtonLoading: {
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statLoading: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
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
    flex: 1,
  },
  menuItemTexts: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
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