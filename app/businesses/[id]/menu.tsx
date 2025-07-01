import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuItemDetail from '../../../components/MenuItemDetail';
import ToastContainer from '../../../components/ToastContainer';
import { useBusiness } from '../../../hooks/useBusiness';
import { useCart } from '../../../hooks/useCart';
import { useFavorites } from '../../../hooks/useFavorites';
import { useMenuCategories, useMenuItems } from '../../../hooks/useMenu';
import { useToast } from '../../../hooks/useToast';
import { MenuItemWithCategory } from '../../../lib/services/MenuService';

const { width } = Dimensions.get('window');

export default function BusinessMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { business, loading: businessLoading, error: businessError } = useBusiness(id);
  const { categories, loading: categoriesLoading, error: categoriesError } = useMenuCategories(id);
  const { menuItems, loading: menuItemsLoading, error: menuItemsError } = useMenuItems(id);
  const { addToCart } = useCart();
  const { addFavoriteMenuItem, removeFavoriteMenuItem, isMenuItemFavorite } = useFavorites();
  const { showToast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithCategory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<Set<number>>(new Set());

  // Sélectionner automatiquement la première catégorie si aucune n'est sélectionnée
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Vérifier l'état des favoris au chargement
  useEffect(() => {
    const checkFavorites = async () => {
      const favoriteItemsSet = new Set<number>();
      for (const item of menuItems) {
        const isFavorite = await isMenuItemFavorite(item.id.toString());
        if (isFavorite) {
          favoriteItemsSet.add(item.id);
        }
      }
      setFavoriteItems(favoriteItemsSet);
    };

    if (menuItems.length > 0) {
      checkFavorites();
    }
  }, [menuItems, isMenuItemFavorite]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all data
      // Note: You would need to add refetch methods to the hooks
    } finally {
      setRefreshing(false);
    }
  };

  const handleBackPress = () => {
    router.back();
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

  const handleQuickAddToCart = async (item: MenuItemWithCategory) => {
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
  };

  const handleToggleFavorite = async (item: MenuItemWithCategory) => {
    try {
      const isFavorite = favoriteItems.has(item.id);
      
      if (isFavorite) {
        const result = await removeFavoriteMenuItem(item.id.toString());
        if (result.success) {
          setFavoriteItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.id);
            return newSet;
          });
          showToast('success', 'Article retiré des favoris');
        }
      } else {
        const result = await addFavoriteMenuItem(item.id.toString());
        if (result.success) {
          setFavoriteItems(prev => new Set(prev).add(item.id));
          showToast('success', 'Article ajouté aux favoris');
        }
      }
    } catch (error) {
      showToast('error', 'Erreur lors de la gestion des favoris');
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
        <MaterialIcons key={i} name="star" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={12} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-border" size={12} color="#FFD700" />
      );
    }

    return stars;
  };

  const renderMenuItem = ({ item }: { item: MenuItemWithCategory }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        {/* Image de l'article */}
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.menuItemImage}
            resizeMode="cover"
          />
        )}
        
        {/* Informations de l'article */}
        <View style={styles.menuItemInfo}>
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
                  handleToggleFavorite(item);
                }}
              >
                <MaterialIcons 
                  name={favoriteItems.has(item.id) ? "favorite" : "favorite-border"} 
                  size={20} 
                  color={favoriteItems.has(item.id) ? "#E31837" : "#666"} 
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
      </View>
    </TouchableOpacity>
  );

  const renderCategoryTab = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.categoryTabActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === item.id && styles.categoryTabTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Filtrer les articles par catégorie sélectionnée
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  if (businessLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (businessError || !business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#E31837" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorMessage}>
            {businessError || 'Commerce non trouvé'}
          </Text>
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
          <Text style={styles.headerTitle}>Menu</Text>
          <Text style={styles.headerSubtitle}>{business.name}</Text>
        </View>
      </View>

      {/* Onglets des catégories */}
      {categoriesLoading ? (
        <View style={styles.categoriesLoading}>
          <Text style={styles.loadingText}>Chargement des catégories...</Text>
        </View>
      ) : categoriesError ? (
        <View style={styles.categoriesError}>
          <Text style={styles.errorText}>Erreur: {categoriesError}</Text>
        </View>
      ) : categories && categories.length > 0 ? (
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      ) : (
        <View style={styles.noCategories}>
          <Text style={styles.noCategoriesText}>Aucune catégorie disponible</Text>
        </View>
      )}

      {/* Liste des articles */}
      {menuItemsLoading ? (
        <View style={styles.menuItemsLoading}>
          <Text style={styles.loadingText}>Chargement des articles...</Text>
        </View>
      ) : menuItemsError ? (
        <View style={styles.menuItemsError}>
          <Text style={styles.errorText}>Erreur: {menuItemsError}</Text>
        </View>
      ) : filteredMenuItems.length > 0 ? (
        <FlatList
          data={filteredMenuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.menuItemsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#E31837']}
              tintColor="#E31837"
            />
          }
        />
      ) : (
        <View style={styles.noMenuItems}>
          <MaterialIcons name="restaurant-menu" size={64} color="#CCC" />
          <Text style={styles.noMenuItemsTitle}>
            {selectedCategory ? 'Aucun article dans cette catégorie' : 'Aucun article disponible'}
          </Text>
          <Text style={styles.noMenuItemsText}>
            {selectedCategory 
              ? 'Cette catégorie ne contient aucun article pour le moment.'
              : 'Ce commerce n\'a pas encore ajouté d\'articles à son menu.'
            }
          </Text>
        </View>
      )}

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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryTabActive: {
    backgroundColor: '#E31837',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTabTextActive: {
    color: '#FFF',
  },
  categoriesLoading: {
    padding: 20,
    alignItems: 'center',
  },
  categoriesError: {
    padding: 20,
    alignItems: 'center',
  },
  noCategories: {
    padding: 20,
    alignItems: 'center',
  },
  noCategoriesText: {
    fontSize: 16,
    color: '#666',
  },
  menuItemsList: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 12,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemInfo: {
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
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#856404',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    borderWidth: 1,
    borderColor: '#E31837',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginLeft: 8,
  },
  addToCartButtonLoading: {
    backgroundColor: '#E31837',
  },
  menuItemsLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemsError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMenuItems: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noMenuItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  noMenuItemsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
  },
  errorText: {
    fontSize: 14,
    color: '#E31837',
    textAlign: 'center',
  },
  menuItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 4,
  },
}); 