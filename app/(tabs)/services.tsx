import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BusinessTypesSkeleton from '../../components/BusinessTypesSkeleton';
import { useBusinessTypes } from '../../hooks/useBusinessTypes';
import { BusinessType } from '../../lib/services/BusinessTypeService';

const { width } = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = (width - (PADDING * 2) - 16) / 3;

export default function ServicesScreen() {
  const { businessTypes, loading, error, refetch } = useBusinessTypes();
  const [refreshing, setRefreshing] = useState(false);
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

  // Fonction pour obtenir le badge selon le type
  const getBadge = (name: string) => {
    const badgeMap: { [key: string]: string } = {
      'supermarket': '24/7',
      'electronics': 'New',
      'pharmacy': '24/7',
      'market': '24/7'
    };
    return badgeMap[name];
  };

  const handleServicePress = (businessType: BusinessType) => {
    // Navigation vers la page des commerces de ce type
    router.push(`/businesses/type/${businessType.name}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tous les Services</Text>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.location}>Conakry</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E31837']}
            tintColor="#E31837"
          />
        }
      >
        {/* Main Services Grid */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <BusinessTypesSkeleton count={12} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#E31837" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {businessTypes.map((businessType) => (
              <TouchableOpacity 
                key={businessType.id} 
                style={styles.mainCard}
                onPress={() => handleServicePress(businessType)}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ 
                      uri: businessType.image_url || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=300&q=80' 
                    }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {getBadge(businessType.name) && (
                    <View style={[
                      styles.badge,
                      { backgroundColor: getBadge(businessType.name) === 'New' ? '#E31837' : '#00C853' }
                    ]}>
                      <Text style={styles.badgeText}>{getBadge(businessType.name)}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{formatBusinessTypeName(businessType.name)}</Text>
                {businessType.description && (
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {businessType.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Statistiques */}
        {!loading && !error && businessTypes.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{businessTypes.length}</Text>
                <Text style={styles.statLabel}>Types de services</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {businessTypes.filter(type => getBadge(type.name)).length}
                </Text>
                <Text style={styles.statLabel}>Services spéciaux</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {businessTypes.filter(type => type.image_url).length}
                </Text>
                <Text style={styles.statLabel}>Avec images</Text>
              </View>
            </View>
          </View>
        )}

        {/* Message si aucun service */}
        {!loading && !error && businessTypes.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="category" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>Aucun service disponible</Text>
            <Text style={styles.emptyMessage}>
              Les services seront bientôt disponibles. Veuillez réessayer plus tard.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: PADDING,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  mainCard: {
    width: CARD_WIDTH,
    marginBottom: 20,
    marginHorizontal: 4,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00C853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#E31837',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  seeAll: {
    marginLeft: 'auto',
    color: '#666',
    fontSize: 14,
  },
  horizontalScroll: {
    paddingRight: PADDING,
  },
  serviceCard: {
    width: width * 0.4,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    aspectRatio: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E31837',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 32,
    padding: PADDING,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E31837',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  cardDescription: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 