import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BusinessTypesGrid from '../../components/BusinessTypesGrid';
import BusinessTypesSkeleton from '../../components/BusinessTypesSkeleton';
import { useBusinessTypes } from '../../hooks/useBusinessTypes';
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
  const { businessTypes, loading, error } = useBusinessTypes();
  const router = useRouter();

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
    return nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Address Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.addressLabel}>Adresse</Text>
          <TouchableOpacity style={styles.addressButton}>
            <Text style={styles.addressText}>Conakry, Conakry, Guinée</Text>
            {/* Icône de flèche conservée pour la cohérence visuelle, mais aucun menu de sélection de lieu */}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => router.push('/search')}
      >
        <MaterialIcons name="search" size={24} color="#666" />
        <Text style={styles.searchPlaceholder}>
          Rechercher des commerces ou produits
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scrollable Banners */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.bannerScroll}
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

        {/* Services Grid */}
        {loading ? (
          <BusinessTypesSkeleton count={8} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Erreur de chargement des services</Text>
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
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllServices}>
              <Text style={styles.seeAllText}>See all</Text>
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
                <Text style={styles.errorText}>Erreur de chargement</Text>
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
});
