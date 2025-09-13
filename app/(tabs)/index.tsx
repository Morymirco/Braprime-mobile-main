import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BusinessTypesGrid from '../../components/BusinessTypesGrid';
import BusinessTypesSkeleton from '../../components/BusinessTypesSkeleton';
import { useBusinessTypes } from '../../hooks/useBusinessTypes';
import { useNotifications } from '../../hooks/useNotifications';
import { useI18n } from '../../lib/contexts/I18nContext';
import { BusinessType } from '../../lib/services/BusinessTypeService';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: 1,
    title: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80'
  },
  {
    id: 2,
    title: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80'
  },
  {
    id: 3,
    title: 'Pharmacy',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80'
  },
  {
    id: 4,
    title: 'Makeup',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
  },
];

export default function HomeScreen() {
  const { businessTypes, loading, error, refetch } = useBusinessTypes();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useI18n();
  
  // Référence pour le ScrollView des banners
  const bannerScrollRef = useRef<ScrollView>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Défilement automatique des banners toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNERS.length;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Fonction pour formater le nom du type de commerce
  const formatBusinessTypeName = (name: string) => {
    const nameMap: { [key: string]: string } = {
      'restaurant': 'Restaurants',
      'cafe': 'Cafés',
      'market': 'Marchés',
      'supermarket': 'Supermarchés',
      'pharmacy': 'Pharmacie',
      'electronics': 'Électronique',
      'beauty': 'Beauté',
      'hairdressing': 'Coiffure',
      'hardware': 'Bricolage',
      'bookstore': 'Librairie',
      'document_service': 'Documents'
    };
    return nameMap[name] || (name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Service');
  };

  const handleBusinessTypePress = (businessType: BusinessType) => {
    // Navigation vers la page des commerces de ce type
    router.push(`/businesses/type/${businessType.name}`);
  };

  const handleSeeAllServices = () => {
    // Navigation vers la page des services
    router.push('/services');
  };

  const handleBannerPress = (banner: any) => {
    // Navigation vers la page des commerces selon le type de bannière
    const bannerTypeMap: { [key: string]: string } = {
      'Breakfast': 'restaurant',
      'Electronics': 'electronics',
      'Pharmacy': 'pharmacy',
      'Makeup': 'beauty'
    };
    
    const businessType = bannerTypeMap[banner.title];
    if (businessType) {
      router.push(`/businesses/${businessType}`);
    }
  };

  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  // Fonction pour gérer le défilement manuel des banners
  const handleBannerScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentBannerIndex(index);
  };

  // Fonction de gestion du refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Erreur lors du refresh de la page d\'accueil:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Address Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.addressLabel}>{t('home.address')}</Text>
          <TouchableOpacity style={styles.addressButton}>
            <Text style={styles.addressText}>Conakry, Conakry, Guinée</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationsPress}
        >
          <Ionicons name="notifications" size={24} color="#000" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => router.push('/search')}
      >
        <MaterialIcons name="search" size={24} color="#666" />
        <Text style={styles.searchPlaceholder}>
          {t('home.searchPlaceholder')}
        </Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E31837']}
            tintColor="#E31837"
          />
        }
      >
        {/* Scrollable Banners */}
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.bannerScroll}
          onScroll={handleBannerScroll}
          scrollEventThrottle={16}
        >
          {BANNERS.map((banner) => (
            <TouchableOpacity 
              key={banner.id} 
              style={styles.bannerContainer}
              onPress={() => handleBannerPress(banner)}
            >
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerText}>{banner.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Indicateurs de pagination */}
        <View style={styles.paginationContainer}>
          {BANNERS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentBannerIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        {/* Services Grid */}
        {loading ? (
          <BusinessTypesSkeleton count={8} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('common.error')}</Text>
          </View>
        ) : (
          <BusinessTypesGrid 
            businessTypes={businessTypes} 
            onPress={handleBusinessTypePress}
            maxItems={8}
          />
        )}

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.popularServices')}</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllServices}>
              <Text style={styles.seeAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.servicesScroll}
            contentContainerStyle={styles.servicesScrollContent}
          >
            {loading ? (
              // Skeleton pour les cartes de services
              Array.from({ length: 4 }).map((_, index) => (
                <View key={index} style={styles.serviceCard}>
                  <View style={[styles.serviceCardImage, { backgroundColor: '#E5E7EB' }]} />
                  <View style={styles.serviceCardOverlay}>
                    <View style={{ backgroundColor: '#E5E7EB', height: 16, width: 80, borderRadius: 4 }} />
                  </View>
                </View>
              ))
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t('common.error')}</Text>
              </View>
            ) : (
              businessTypes.slice(0, 4).map((businessType) => (
                <TouchableOpacity 
                  key={businessType.id} 
                  style={styles.serviceCard}
                  onPress={() => handleBusinessTypePress(businessType)}
                >
                  <Image
                    source={{ uri: businessType.image_url || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80' }}
                    style={styles.serviceCardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.serviceCardOverlay}>
                    <Text style={styles.serviceCardTitle}>{formatBusinessTypeName(businessType.name)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  bannerScroll: {
    height: 180,
  },
  bannerContainer: {
    width: width - 32,
    height: 180,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  servicesSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#E31837',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seeAllButton: {
    marginLeft: 'auto',
  },
  seeAllText: {
    color: '#666',
    fontSize: 16,
  },
  servicesScroll: {
    marginBottom: 24,
  },
  servicesScrollContent: {
    paddingRight: 16,
  },
  serviceCard: {
    width: 200,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceCardImage: {
    width: '100%',
    height: '100%',
  },
  serviceCardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  serviceCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#E31837',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E31837',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#E31837',
    width: 12,
    height: 8,
    borderRadius: 4,
  },
});
