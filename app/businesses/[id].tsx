import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useFavorites } from '../../hooks/useFavorites';
import { useMenuCategories, useMenuItems } from '../../hooks/useMenu';
import { useToast } from '../../hooks/useToast';

const { width } = Dimensions.get('window');

export default function BusinessDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Try different ways to get the ID
  const businessId = params.id || (params as any).id || '';
  
  const { business, loading, error, refetch } = useBusiness(businessId);
  const { categories, loading: categoriesLoading } = useMenuCategories(businessId);
  const { menuItems, loading: menuLoading } = useMenuItems(businessId);
  const { addToCart } = useCart();
  const { addFavoriteBusiness, removeFavoriteBusiness, isBusinessFavorite, addFavoriteMenuItem, removeFavoriteMenuItem, isMenuItemFavorite } = useFavorites();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithCategory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMenuItems, setFavoriteMenuItems] = useState<Set<number>>(new Set());
  const [favoritesChecked, setFavoritesChecked] = useState(false);

  // Vérifier l'état des favoris au chargement (une seule fois)
  useEffect(() => {
    const checkFavorites = async () => {
      if (business && menuItems.length > 0 && !favoritesChecked) {
        try {
          // Vérifier si le commerce est en favori
          const businessFavorite = await isBusinessFavorite(business.id.toString());
          setIsFavorite(businessFavorite);
          
          // Vérifier les articles favoris
          const favoriteItems = new Set<number>();
          for (const item of menuItems) {
            const isFavorite = await isMenuItemFavorite(item.id.toString());
            if (isFavorite) {
              favoriteItems.add(item.id);
            }
          }
          setFavoriteMenuItems(favoriteItems);
          setFavoritesChecked(true);
        } catch (error) {
          console.error('Erreur lors de la vérification des favoris:', error);
        }
      }
    };

    checkFavorites();
  }, [business, menuItems, favoritesChecked, isBusinessFavorite, isMenuItemFavorite]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      setFavoritesChecked(false); // Réinitialiser pour re-vérifier les favoris
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleCallPress = useCallback(() => {
    if (business?.phone) {
      Linking.openURL(`tel:${business.phone}`);
    }
  }, [business?.phone]);

  const handleEmailPress = useCallback(() => {
    if (business?.email) {
      Linking.openURL(`mailto:${business.email}`);
    }
  }, [business?.email]);

  const handleCategoryPress = useCallback((categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  }, [selectedCategory]);

  const handleMenuItemPress = useCallback((item: MenuItemWithCategory) => {
    setSelectedMenuItem(item);
    setModalVisible(true);
  }, []);

  const handleAddToCart = useCallback(async (item: MenuItemWithCategory, quantity: number, specialInstructions?: string) => {
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
  }, [business, addToCart, showToast]);

  const handleQuickAddToCart = useCallback(async (item: MenuItemWithCategory) => {
    if (!business) {
      showToast('error', 'Erreur: Commerce non trouvé');
      return;
    }

    setAddingToCart(item.id);
    try {
      const result = await addToCart(
        {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
          special_instructions: '',
        },
        business.id,
        business.name
      );

      if (result.success) {
        showToast('success', `${item.name} ajouté au panier`);
      } else {
        showToast('error', result.error || 'Erreur lors de l\'ajout au panier');
      }
    } catch (error) {
      showToast('error', 'Erreur lors de l\'ajout au panier');
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setAddingToCart(null);
    }
  }, [business, addToCart, showToast]);

  const handleToggleFavorite = useCallback(async () => {
    if (!business) return;

    try {
      if (isFavorite) {
        const result = await removeFavoriteBusiness(business.id.toString());
        if (result.success) {
          setIsFavorite(false);
          showToast('success', 'Commerce retiré des favoris');
        }
      } else {
        const result = await addFavoriteBusiness(business.id.toString());
        if (result.success) {
          setIsFavorite(true);
          showToast('success', 'Commerce ajouté aux favoris');
        }
      }
    } catch (error) {
      showToast('error', 'Erreur lors de la gestion des favoris');
    }
  }, [business, isFavorite, addFavoriteBusiness, removeFavoriteBusiness, showToast]);

  const handleToggleMenuItemFavorite = useCallback(async (item: MenuItemWithCategory) => {
    try {
      const isItemFavorite = favoriteMenuItems.has(item.id);
      
      if (isItemFavorite) {
        const result = await removeFavoriteMenuItem(item.id.toString());
        if (result.success) {
          setFavoriteMenuItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.id);
            return newSet;
          });
          showToast('success', 'Article retiré des favoris');
        }
      } else {
        const result = await addFavoriteMenuItem(item.id.toString());
        if (result.success) {
          setFavoriteMenuItems(prev => new Set(prev).add(item.id));
          showToast('success', 'Article ajouté aux favoris');
        }
      }
    } catch (error) {
      showToast('error', 'Erreur lors de la gestion des favoris');
    }
  }, [favoriteMenuItems, addFavoriteMenuItem, removeFavoriteMenuItem, showToast]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedMenuItem(null);
  }, []);

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
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <MaterialIcons 
            name={isFavorite ? "favorite" : "favorite-border"} 
            size={24} 
            color={isFavorite ? "#E31837" : "#666"} 
          />
        </TouchableOpacity>
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
        {/* Image de couverture avec overlay et informations */}
        <View style={styles.coverContainer}>
        <Image
          source={{
            uri: business.cover_image || business.logo || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80'
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />
          <View style={styles.coverOverlay} />

          {/* Informations superposées */}
          <View style={styles.coverInfo}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: business.logo || business.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80'
                }}
                style={styles.businessLogo}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{business.name}</Text>
          
              <View style={styles.businessMeta}>
                {business.cuisine_type && (
                  <Text style={styles.cuisineType}>{business.cuisine_type}</Text>
                )}
                
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(business.rating)}
                  </View>
                  <Text style={styles.ratingText}>
                    {business.rating.toFixed(1)} ({business.review_count})
                  </Text>
                </View>
                
                <View style={styles.deliveryInfo}>
                  <MaterialIcons name="access-time" size={16} color="#FFF" />
                  <Text style={styles.deliveryText}>{business.delivery_time}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Informations principales */}
        <View style={styles.mainInfo}>
          {business.description && (
            <Text style={styles.description}>{business.description}</Text>
          )}

          {/* Type de commerce */}
          <View style={styles.typeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: business.business_type.color }]}>
              <Text style={styles.typeText}>{business.business_type.name}</Text>
            </View>
          </View>

          {/* Statut d'ouverture */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: business.is_open ? '#00C853' : '#E31837' }
            ]} />
            <Text style={styles.statusText}>
              {business.is_open ? 'Ouvert' : 'Fermé'}
            </Text>
          </View>
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
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.menuItemCard}
                      onPress={() => handleMenuItemPress(item)}
                      activeOpacity={0.7}
                    >
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
                          <View style={styles.menuItemBadges}>
                          {item.is_popular && (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularText}>Populaire</Text>
                            </View>
                          )}
                            <TouchableOpacity
                              style={styles.favoriteButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleToggleMenuItemFavorite(item);
                              }}
                            >
                              <MaterialIcons 
                                name={favoriteMenuItems.has(item.id) ? "favorite" : "favorite-border"} 
                                size={20} 
                                color={favoriteMenuItems.has(item.id) ? "#E31837" : "#666"} 
                              />
                            </TouchableOpacity>
                          </View>
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
                              styles.addToCartButton,
                              addingToCart === item.id && styles.addToCartButtonLoading
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleQuickAddToCart(item);
                            }}
                            disabled={addingToCart === item.id}
                          >
                            {addingToCart === item.id ? (
                              <MaterialIcons name="hourglass-empty" size={20} color="#E31837" />
                            ) : (
                              <MaterialIcons name="add-shopping-cart" size={20} color="#E31837" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
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
  coverContainer: {
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  coverInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 4,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  businessLogo: {
    width: '100%',
    height: '100%',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cuisineType: {
    fontSize: 14,
    color: '#FFF',
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFF',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
  },
  mainInfo: {
    padding: 16,
    backgroundColor: '#fff',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
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
  menuItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addToCartButton: {
    padding: 8,
  },
  addToCartButtonLoading: {
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
  favoriteButton: {
    padding: 8,
  },
}); 