import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { MenuItemWithCategory } from '../lib/services/MenuService';

const { width, height } = Dimensions.get('window');

interface MenuItemDetailProps {
  item: MenuItemWithCategory | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItemWithCategory) => void;
}

export default function MenuItemDetail({ item, visible, onClose, onAddToCart }: MenuItemDetailProps) {
  if (!item) return null;

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de l'article</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image */}
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {/* Informations principales */}
          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.name}</Text>
              {item.is_popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Populaire</Text>
                </View>
              )}
            </View>

            <Text style={styles.price}>{item.price.toLocaleString()} GNF</Text>

            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}

            {/* Catégorie */}
            <View style={styles.categoryContainer}>
              <MaterialIcons name="category" size={16} color="#666" />
              <Text style={styles.categoryText}>{item.category.name}</Text>
            </View>

            {/* Temps de préparation */}
            {item.preparation_time && (
              <View style={styles.prepTimeContainer}>
                <MaterialIcons name="access-time" size={16} color="#666" />
                <Text style={styles.prepTimeText}>
                  Temps de préparation: {item.preparation_time} min
                </Text>
              </View>
            )}

            {/* Allergènes */}
            {item.allergens && item.allergens.length > 0 && (
              <View style={styles.allergensContainer}>
                <Text style={styles.sectionTitle}>Allergènes</Text>
                <View style={styles.allergensList}>
                  {item.allergens.map((allergen, index) => (
                    <View key={index} style={styles.allergenTag}>
                      <Text style={styles.allergenText}>{allergen}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Informations nutritionnelles */}
            {item.nutritional_info && Object.keys(item.nutritional_info).length > 0 && (
              <View style={styles.nutritionContainer}>
                <Text style={styles.sectionTitle}>Informations nutritionnelles</Text>
                {Object.entries(item.nutritional_info).map(([key, value]) => (
                  <View key={key} style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>{key}:</Text>
                    <Text style={styles.nutritionValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bouton d'action */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => onAddToCart(item)}
          >
            <MaterialIcons name="add-shopping-cart" size={20} color="#FFF" />
            <Text style={styles.addToCartText}>Ajouter au panier</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  mainInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E31837',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  prepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  prepTimeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  allergensContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  allergensList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergenTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  allergenText: {
    fontSize: 12,
    color: '#666',
  },
  nutritionContainer: {
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  nutritionValue: {
    fontSize: 14,
    color: '#000',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    backgroundColor: '#E31837',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 