import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BusinessCardSkeleton from '../../components/BusinessesSkeleton';
import { useBusinessesByTypeName } from '../../hooks/useBusinesses';
import { BusinessWithType } from '../../lib/services/BusinessService';

export default function BusinessListScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { businesses, loading, error, refetch } = useBusinessesByTypeName(type || '');

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

  // Filtrer les commerces selon la recherche
  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBusinessPress = (business: BusinessWithType) => {
    // Navigation vers la page détaillée du commerce
    console.log('Navigation vers le commerce:', business.name);
    // TODO: Implémenter la navigation vers la page détaillée
    Alert.alert('Commerce sélectionné', `Vous avez sélectionné ${business.name}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialIcons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
      );
    }

    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{formatBusinessTypeName(type || '')}</Text>
          <Text style={styles.subtitle}>
            {businesses.length} commerce{businesses.length !== 1 ? 's' : ''} disponible{businesses.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un commerce..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

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
        {loading && !refreshing ? (
          <BusinessCardSkeleton count={6} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#E31837" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBusinesses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="store" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun commerce trouvé' : 'Aucun commerce disponible'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchQuery 
                ? 'Essayez de modifier votre recherche'
                : 'Les commerces seront bientôt disponibles'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.businessList}>
            {filteredBusinesses.map((business) => (
              <TouchableOpacity
                key={business.id}
                style={styles.businessCard}
                onPress={() => handleBusinessPress(business)}
              >
                <Image
                  source={{
                    uri: business.cover_image || business.logo || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=200&q=80'
                  }}
                  style={styles.businessImage}
                  resizeMode="cover"
                />
                <View style={styles.businessContent}>
                  <View style={styles.businessHeader}>
                    <Text style={styles.businessName}>{business.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: business.is_open ? '#00C853' : '#E31837' }
                    ]}>
                      <Text style={styles.statusText}>
                        {business.is_open ? 'Ouvert' : 'Fermé'}
                      </Text>
                    </View>
                  </View>
                  
                  {business.description && (
                    <Text style={styles.businessDescription} numberOfLines={2}>
                      {business.description}
                    </Text>
                  )}

                  <View style={styles.businessDetails}>
                    <View style={styles.ratingContainer}>
                      {renderStars(business.rating)}
                      <Text style={styles.ratingText}>
                        {business.rating.toFixed(1)} ({business.review_count})
                      </Text>
                    </View>
                    
                    <View style={styles.deliveryInfo}>
                      <MaterialIcons name="access-time" size={16} color="#666" />
                      <Text style={styles.deliveryText}>{business.delivery_time}</Text>
                    </View>
                  </View>

                  <View style={styles.businessFooter}>
                    <View style={styles.addressContainer}>
                      <MaterialIcons name="location-on" size={16} color="#666" />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {business.address}
                      </Text>
                    </View>
                    
                    <Text style={styles.deliveryFee}>
                      Livraison: {business.delivery_fee.toLocaleString()} GNF
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  businessList: {
    paddingHorizontal: 16,
  },
  businessCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 1,
  },
  businessImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  businessContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  businessDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  businessDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  deliveryFee: {
    fontSize: 12,
    color: '#E31837',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  errorTitle: {
    fontSize: 20,
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