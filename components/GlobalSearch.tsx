import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useGlobalSearch } from '../hooks/useBusinesses';
import { BusinessWithType } from '../lib/services/BusinessService';

interface GlobalSearchProps {
  onClose?: () => void;
}

export default function GlobalSearch({ onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { businesses, menuItems, loading, error, search, clearResults } = useGlobalSearch();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        search(searchQuery);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleBusinessPress = (business: BusinessWithType) => {
    // Navigation vers la page détaillée du commerce
    console.log('Navigation vers le commerce:', business.name);
    // TODO: Implémenter la navigation vers la page détaillée
  };

  const handleMenuItemPress = (menuItem: any) => {
    // Navigation vers la page du commerce avec l'élément sélectionné
    console.log('Navigation vers l\'élément de menu:', menuItem.name);
    // TODO: Implémenter la navigation vers la page du commerce
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearResults();
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const renderBusinessItem = ({ item }: { item: BusinessWithType }) => (
    <TouchableOpacity
      style={styles.businessItem}
      onPress={() => handleBusinessPress(item)}
    >
      <Image
        source={{
          uri: item.cover_image || item.logo || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=200&q=80'
        }}
        style={styles.businessImage}
        resizeMode="cover"
      />
      <View style={styles.businessContent}>
        <Text style={styles.businessName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.businessDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.businessDetails}>
          <MaterialIcons name="store" size={16} color="#666" />
          <Text style={styles.businessType}>
            {item.business_type?.name || 'Commerce'}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item)}
    >
      <Image
        source={{
          uri: item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&q=80'
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
        <View style={styles.menuItemDetails}>
          <Text style={styles.menuItemPrice}>
            {item.price?.toLocaleString()} GNF
          </Text>
          <Text style={styles.menuItemStore}>
            {item.business?.name || 'Commerce'}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>({count})</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="search" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Aucun résultat trouvé' : 'Recherchez des commerces ou produits'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery 
          ? 'Essayez de modifier votre recherche'
          : 'Tapez pour commencer votre recherche'
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={48} color="#E31837" />
      <Text style={styles.errorTitle}>Erreur de recherche</Text>
      <Text style={styles.errorMessage}>{error}</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Recherche en cours...</Text>
    </View>
  );

  const renderResults = () => {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();
    if (!searchQuery.trim()) return renderEmptyState();

    const hasResults = businesses.length > 0 || menuItems.length > 0;
    if (!hasResults) return renderEmptyState();

    return (
      <FlatList
        data={[
          ...(businesses.length > 0 ? [{ type: 'businesses', data: businesses }] : []),
          ...(menuItems.length > 0 ? [{ type: 'menuItems', data: menuItems }] : [])
        ]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => (
          <View>
            {item.type === 'businesses' && renderSectionHeader('Commerces', item.data.length)}
            {item.type === 'menuItems' && renderSectionHeader('Produits', item.data.length)}
            <FlatList
              data={item.data}
              keyExtractor={(subItem) => subItem.id.toString()}
              renderItem={item.type === 'businesses' ? renderBusinessItem : renderMenuItem}
              scrollEnabled={false}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des commerces ou produits..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {renderResults()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  resultsContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 1,
  },
  businessImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  businessContent: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  businessDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessType: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 1,
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  menuItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E31837',
  },
  menuItemStore: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
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
}); 