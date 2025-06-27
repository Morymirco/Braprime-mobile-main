import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BusinessDetailSkeleton from '../../components/BusinessDetailSkeleton';
import MenuItemDetail from '../../components/MenuItemDetail';
import MenuSkeleton from '../../components/MenuSkeleton';
import ToastContainer from '../../components/ToastContainer';
import { useBusiness } from '../../hooks/useBusiness';
import { useCart } from '../../hooks/useCart';
import { useMenuCategories, useMenuItems } from '../../hooks/useMenu';
import { useToast } from '../../hooks/useToast';

const { width } = Dimensions.get('window');

export default function BusinessDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Debug logging
  console.log('🔍 Business Detail - All params:', params);
  console.log('🔍 Business Detail - ID param:', params.id, 'Type:', typeof params.id);
  
  // Try different ways to get the ID
  const businessId = params.id || (params as any).id || '';
  console.log('🔍 Business Detail - Final businessId:', businessId, 'Type:', typeof businessId);
  
  const { business, loading, error, refetch } = useBusiness(businessId);
  const { categories, loading: categoriesLoading } = useMenuCategories(businessId);
  const { menuItems, loading: menuLoading } = useMenuItems(businessId);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithCategory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleCallPress = () => {
    if (business?.phone) {
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  const handleEmailPress = () => {
    if (business?.email) {
      Linking.openURL(`mailto:${business.email}`);
    }
  };

  const handleOrderPress = () => {
    if (business) {
      router.push(`/checkout?businessId=${business.id}`);
    }
  };

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleMenuItemPress = (item: MenuItemWithCategory) => {
    setSelectedMenuItem(item);
    setModalVisible(true);
  };

  const handleAddToCart = async (item: MenuItemWithCategory, quantity: number, specialInstructions?: string) => {
    if (!business) {
      showToast('error', 'Erreur: Commerce non trouvé');
      return;
    }

    try {
      const result = await addToCart(
        {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          image: item.image,
          special_instructions: specialInstructions,
        },
        business.id,
        business.name
      );

      if (result.success) {
        showToast('success', `${quantity}x ${item.name} ajouté au panier`);
        setModalVisible(false);
        setSelectedMenuItem(null);
      } else {
        showToast('error', result.error || 'Erreur lors de l\'ajout au panier');
      }
    } catch (error) {
      showToast('error', 'Erreur lors de l\'ajout au panier');
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMenuItem(null);
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

  // Filtrer les articles par catégorie sélectionnée
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header skeleton */}
        <View style={styles.header}>
          <View style={styles.backButtonSkeleton} />
          <View style={styles.headerContent}>
            <View style={styles.headerTitleSkeleton} />
            <View style={styles.statusBadgeSkeleton} />
          </View>
        </View>
        <BusinessDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#E31837" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="store" size={64} color="#CCC" />
          <Text style={styles.errorTitle}>Commerce non trouvé</Text>
          <Text style={styles.errorMessage}>Le commerce demandé n'existe pas ou a été supprimé.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{business.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: business.is_open ? '#00C853' : '#E31837' }
          ]}>
            <Text style={styles.statusText}>
              {business.is_open ? 'Ouvert' : 'Fermé'}
            </Text>
          </View>
        </View>
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
        {/* Image de couverture */}
        <Image
          source={{
            uri: business.cover_image || business.logo || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80'
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Informations principales */}
        <View style={styles.mainInfo}>
          <Text style={styles.businessName}>{business.name}</Text>
          
          {business.description && (
            <Text style={styles.description}>{business.description}</Text>
          )}

          {/* Type de commerce */}
          <View style={styles.typeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: business.business_type.color }]}>
              <Text style={styles.typeText}>{business.business_type.name}</Text>
            </View>
          </View>

          {/* Note et avis */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(business.rating)}
            </View>
            <Text style={styles.ratingText}>
              {business.rating.toFixed(1)} ({business.review_count} avis)
            </Text>
          </View>
        </View>

        {/* Actions principales */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleOrderPress}
          >
            <MaterialIcons name="shopping-cart" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Commander</Text>
          </TouchableOpacity>
        </View>

        {/* Section Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          {categoriesLoading || menuLoading ? (
            <MenuSkeleton categoryCount={3} itemCount={6} />
          ) : categories.length === 0 ? (
            <View style={styles.emptyMenuContainer}>
              <MaterialIcons name="restaurant-menu" size={48} color="#CCC" />
              <Text style={styles.emptyMenuTitle}>Menu non disponible</Text>
              <Text style={styles.emptyMenuMessage}>
                Ce commerce n'a pas encore de menu en ligne.
              </Text>
            </View>
          ) : (
            <>
              {/* Catégories */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    !selectedCategory && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[
                    styles.categoryText,
                    !selectedCategory && styles.categoryTextActive
                  ]}>
                    Tout
                  </Text>
                </TouchableOpacity>
                
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Articles du menu */}
              <View style={styles.menuItemsContainer}>
                {filteredMenuItems.length === 0 ? (
                  <View style={styles.emptyCategoryContainer}>
                    <MaterialIcons name="restaurant" size={32} color="#CCC" />
                    <Text style={styles.emptyCategoryText}>
                      Aucun article dans cette catégorie
                    </Text>
                  </View>
                ) : (
                  filteredMenuItems.map((item) => (
                    <View key={item.id} style={styles.menuItemCard}>
                      <Image
                        source={{
                          uri: item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&q=80'
                        }}
                        style={styles.menuItemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.menuItemContent}>
                        <View style={styles.menuItemHeader}>
                          <Text style={styles.menuItemName}>{item.name}</Text>
                          {item.is_popular && (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularText}>Populaire</Text>
                            </View>
                          )}
                        </View>
                        
                        {item.description && (
                          <Text style={styles.menuItemDescription} numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                        
                        <View style={styles.menuItemFooter}>
                          <Text style={styles.menuItemPrice}>
                            {item.price.toLocaleString()} GNF
                          </Text>
                          <TouchableOpacity 
                            style={[
                              styles.addButton,
                              addingToCart === item.id && styles.addButtonLoading
                            ]}
                            onPress={() => handleMenuItemPress(item)}
                            disabled={addingToCart === item.id}
                          >
                            {addingToCart === item.id ? (
                              <MaterialIcons name="hourglass-empty" size={20} color="#E31837" />
                            ) : (
                              <MaterialIcons name="add" size={20} color="#E31837" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </View>

        {/* Informations de contact */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          
          <View style={styles.contactItem}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.contactText}>{business.address}</Text>
          </View>

          {business.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCallPress}>
              <MaterialIcons name="phone" size={20} color="#666" />
              <Text style={[styles.contactText, styles.linkText]}>{business.phone}</Text>
            </TouchableOpacity>
          )}

          {business.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <MaterialIcons name="email" size={20} color="#666" />
              <Text style={[styles.contactText, styles.linkText]}>{business.email}</Text>
            </TouchableOpacity>
          )}

          {business.opening_hours && (
            <View style={styles.contactItem}>
              <MaterialIcons name="access-time" size={20} color="#666" />
              <Text style={styles.contactText}>{business.opening_hours}</Text>
            </View>
          )}
        </View>

        {/* Informations de livraison */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Informations de livraison</Text>
          
          <View style={styles.deliveryItem}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.deliveryText}>Temps de livraison: {business.delivery_time}</Text>
          </View>

          <View style={styles.deliveryItem}>
            <MaterialIcons name="local-shipping" size={20} color="#666" />
            <Text style={styles.deliveryText}>Frais de livraison: {business.delivery_fee.toLocaleString()} GNF</Text>
          </View>
        </View>

        {/* Espace en bas pour éviter que le contenu soit caché */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de détail de l'article */}
      <MenuItemDetail
        item={selectedMenuItem}
        visible={modalVisible}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backButtonSkeleton: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTitleSkeleton: {
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusBadgeSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    width: 60,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  mainInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  typeContainer: {
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#E31837',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuSection: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#E31837',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  menuItemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  menuItemImage: {
    width: 60,
    height: 60,
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
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E31837',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonLoading: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  emptyMenuContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMenuMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyCategoryContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyCategoryText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  contactSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    color: '#E31837',
    textDecorationLine: 'underline',
  },
  deliverySection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 