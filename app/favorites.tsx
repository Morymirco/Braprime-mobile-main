import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../lib/contexts/AuthContext';

const { width } = Dimensions.get('window');

// Types pour les favoris
interface FavoriteBusiness {
  id: string;
  name: string;
  description: string;
  image: string;
  address: string;
  rating: number;
  delivery_time: string;
  minimum_order: number;
  is_open: boolean;
  business_type: {
    id: number;
    name: string;
  };
}

interface FavoriteMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  business_name: string;
  business_id: string;
  is_popular: boolean;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'businesses' | 'menu'>('businesses');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Données de démonstration pour les favoris
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<FavoriteBusiness[]>([
    {
      id: '1',
      name: 'Restaurant Le Gourmet',
      description: 'Cuisine française raffinée',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
      address: '123 Rue de la Paix, Conakry',
      rating: 4.5,
      delivery_time: '30-45 min',
      minimum_order: 15000,
      is_open: true,
      business_type: { id: 1, name: 'Restaurant' }
    },
    {
      id: '2',
      name: 'Pizza Express',
      description: 'Pizzas authentiques italiennes',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80',
      address: '456 Avenue du Commerce, Conakry',
      rating: 4.2,
      delivery_time: '25-35 min',
      minimum_order: 12000,
      is_open: true,
      business_type: { id: 2, name: 'Pizzeria' }
    },
    {
      id: '3',
      name: 'Café Central',
      description: 'Café et pâtisseries artisanales',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
      address: '789 Boulevard de la République, Conakry',
      rating: 4.7,
      delivery_time: '20-30 min',
      minimum_order: 8000,
      is_open: false,
      business_type: { id: 3, name: 'Café' }
    }
  ]);

  const [favoriteMenuItems, setFavoriteMenuItems] = useState<FavoriteMenuItem[]>([
    {
      id: '1',
      name: 'Pizza Margherita',
      description: 'Sauce tomate, mozzarella, basilic frais',
      price: 18000,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80',
      business_name: 'Pizza Express',
      business_id: '2',
      is_popular: true
    },
    {
      id: '2',
      name: 'Burger Classique',
      description: 'Steak, fromage, salade, tomate, oignon',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
      business_name: 'Restaurant Le Gourmet',
      business_id: '1',
      is_popular: false
    },
    {
      id: '3',
      name: 'Cappuccino',
      description: 'Café italien avec mousse de lait crémeuse',
      price: 5000,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
      business_name: 'Café Central',
      business_id: '3',
      is_popular: true
    }
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simuler un chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('success', 'Favoris actualisés');
    } catch (error) {
      showToast('error', 'Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveFavoriteBusiness = (businessId: string) => {
    setFavoriteBusinesses(prev => prev.filter(business => business.id !== businessId));
    showToast('success', 'Commerce retiré des favoris');
  };

  const handleRemoveFavoriteMenuItem = (itemId: string) => {
    setFavoriteMenuItems(prev => prev.filter(item => item.id !== itemId));
    showToast('success', 'Article retiré des favoris');
  };

  const handleBusinessPress = (business: FavoriteBusiness) => {
    router.push(`/businesses/${business.id}`);
  };

  const handleMenuItemPress = (item: FavoriteMenuItem) => {
    router.push(`/businesses/${item.business_id}`);
  };

  const renderBusinessItem = ({ item }: { item: FavoriteBusiness }) => (
    <TouchableOpacity 
      style={styles.businessCard}
      onPress={() => handleBusinessPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.businessImage} />
      
      <View style={styles.businessContent}>
        <View style={styles.businessHeader}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{item.name}</Text>
            <Text style={styles.businessType}>{item.business_type.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavoriteBusiness(item.id)}
          >
            <MaterialIcons name="favorite" size={24} color="#E31837" />
          </TouchableOpacity>
        </View>

        <Text style={styles.businessDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.businessDetails}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          
          <View style={styles.deliveryInfo}>
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text style={styles.deliveryText}>{item.delivery_time}</Text>
          </View>

          <View style={styles.minOrderInfo}>
            <MaterialIcons name="shopping-bag" size={14} color="#666" />
            <Text style={styles.minOrderText}>Min. {item.minimum_order.toLocaleString()} GNF</Text>
          </View>
        </View>

        <View style={styles.businessFooter}>
          <Text style={styles.businessAddress} numberOfLines={1}>
            {item.address}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.is_open ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {item.is_open ? 'Ouvert' : 'Fermé'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: FavoriteMenuItem }) => (
    <TouchableOpacity 
      style={styles.menuItemCard}
      onPress={() => handleMenuItemPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemBusiness}>{item.business_name}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavoriteMenuItem(item.id)}
          >
            <MaterialIcons name="favorite" size={24} color="#E31837" />
          </TouchableOpacity>
        </View>

        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.menuItemFooter}>
          <Text style={styles.menuItemPrice}>
            {item.price.toLocaleString()} GNF
          </Text>
          {item.is_popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Populaire</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="favorite-border" size={64} color="#CCC" />
          <Text style={styles.errorTitle}>Connexion requise</Text>
          <Text style={styles.errorMessage}>
            Vous devez être connecté pour accéder à vos favoris.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ToastContainer />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Favoris</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'businesses' && styles.activeTab
          ]}
          onPress={() => setActiveTab('businesses')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'businesses' && styles.activeTabText
          ]}>
            Commerces ({favoriteBusinesses.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'menu' && styles.activeTab
          ]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'menu' && styles.activeTabText
          ]}>
            Articles ({favoriteMenuItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'businesses' ? favoriteBusinesses : favoriteMenuItems}
        renderItem={activeTab === 'businesses' ? renderBusinessItem : renderMenuItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E31837']}
            tintColor="#E31837"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name="favorite-border" 
              size={64} 
              color="#CCC" 
            />
            <Text style={styles.emptyTitle}>
              Aucun favori {activeTab === 'businesses' ? 'commerce' : 'article'}
            </Text>
            <Text style={styles.emptyMessage}>
              {activeTab === 'businesses' 
                ? 'Ajoutez des commerces à vos favoris pour les retrouver facilement.'
                : 'Ajoutez des articles à vos favoris pour les commander rapidement.'
              }
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.browseButtonText}>
                Parcourir les commerces
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E31837',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessImage: {
    width: '100%',
    height: 200,
  },
  businessContent: {
    padding: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    color: '#666',
  },
  favoriteButton: {
    padding: 4,
  },
  businessDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  businessDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  minOrderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minOrderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  menuItemBusiness: {
    fontSize: 14,
    color: '#666',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31837',
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 