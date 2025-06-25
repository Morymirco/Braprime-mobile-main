import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusinessService } from '../../lib/services/BusinessService';
import { supabase } from '../../lib/supabase/config';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: number;
  is_available: boolean;
}

interface MenuCategory {
  id: number;
  name: string;
  description: string | null;
  menu_items: MenuItem[];
}

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Identifiant de commerce manquant.');
      setLoading(false);
      return;
    }

    const businessId = Number(id);
    if (isNaN(businessId)) {
      setError('Identifiant de commerce invalide.');
      setLoading(false);
      return;
    }

    loadBusinessDetails(businessId);
  }, [id]);

  const loadBusinessDetails = async (businessId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Charger les détails du commerce
      const businessData = await BusinessService.getBusinessById(businessId);
      setBusiness(businessData);

      // Charger les catégories de menu et leurs éléments
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select(`
          id,
          name,
          description,
          menu_items (
            id,
            name,
            description,
            price,
            image_url,
            category_id,
            is_available
          )
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        console.error('Erreur lors du chargement des catégories:', categoriesError);
        setMenuCategories([]);
      } else {
        // Filtrer les éléments de menu disponibles
        const filteredCategories = categories?.map(category => ({
          ...category,
          menu_items: category.menu_items?.filter(item => item.is_available) || []
        })) || [];
        setMenuCategories(filteredCategories);
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors du chargement du commerce.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleMenuItemPress = (menuItem: MenuItem) => {
    Alert.alert(
      menuItem.name,
      `${menuItem.description || 'Aucune description'}\n\nPrix: ${menuItem.price.toLocaleString()} GNF`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ajouter au panier', onPress: () => console.log('Ajouter au panier:', menuItem.name) }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Chargement du commerce...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#E31837" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorMessage}>{error || 'Commerce introuvable.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
            <Text style={styles.retryText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{business.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image principale */}
        <Image
          source={{ 
            uri: business.cover_image || business.logo || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80' 
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Infos principales */}
        <View style={styles.infoSection}>
          <Text style={styles.businessName}>{business.name}</Text>
          {business.business_type?.name && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{business.business_type.name}</Text>
            </View>
          )}
          {business.description && (
            <Text style={styles.businessDescription}>{business.description}</Text>
          )}
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailsRow}>
              <MaterialIcons name="location-on" size={18} color="#E31837" />
              <Text style={styles.detailText}>{business.address}</Text>
            </View>
            {business.opening_hours && (
              <View style={styles.detailsRow}>
                <MaterialIcons name="schedule" size={18} color="#E31837" />
                <Text style={styles.detailText}>{business.opening_hours}</Text>
              </View>
            )}
            {business.phone && (
              <View style={styles.detailsRow}>
                <MaterialIcons name="phone" size={18} color="#E31837" />
                <Text style={styles.detailText}>{business.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu par catégories */}
        {menuCategories.length === 0 ? (
          <View style={styles.emptyMenuSection}>
            <MaterialIcons name="restaurant-menu" size={48} color="#CCC" />
            <Text style={styles.emptyMenuTitle}>Menu non disponible</Text>
            <Text style={styles.emptyMenuText}>
              Ce commerce n'a pas encore de menu disponible.
            </Text>
          </View>
        ) : (
          menuCategories.map(category => (
            <View key={category.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              {category.description && (
                <Text style={styles.categoryDescription}>{category.description}</Text>
              )}
              
              {category.menu_items.length === 0 ? (
                <Text style={styles.emptyCategoryText}>
                  Aucun article disponible dans cette catégorie.
                </Text>
              ) : (
                category.menu_items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item)}
                  >
                    <Image
                      source={{ 
                        uri: item.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&q=80' 
                      }}
                      style={styles.menuItemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      {item.description && (
                        <Text style={styles.menuItemDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                      <Text style={styles.menuItemPrice}>
                        {item.price.toLocaleString()} GNF
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#666" />
                  </TouchableOpacity>
                ))
              )}
            </View>
          ))
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E31837',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  businessDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  detailsContainer: {
    gap: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 15,
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  categorySection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E31837',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emptyCategoryText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  menuItemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31837',
  },
  emptyMenuSection: {
    backgroundColor: '#fff',
    padding: 40,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMenuText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    fontSize: 16,
    color: '#666',
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
}); 