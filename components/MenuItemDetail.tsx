import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { MenuItemWithCategory } from '../lib/services/MenuService';

const { width, height } = Dimensions.get('window');

interface MenuItemDetailProps {
  item: MenuItemWithCategory | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItemWithCategory, quantity: number, specialInstructions?: string) => void;
}

export default function MenuItemDetail({ item, visible, onClose, onAddToCart }: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!item) return null;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await onAddToCart(item, quantity, specialInstructions.trim() || undefined);
      // Reset form after successful add
      setQuantity(1);
      setSpecialInstructions('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setIsAddingToCart(false);
    }
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

  const totalPrice = item.price * quantity;

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

            {/* Note et avis */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(item.rating || 0)}
              </View>
              <Text style={styles.ratingText}>
                {item.rating ? `${item.rating.toFixed(1)}/5` : 'Pas encore noté'}
              </Text>
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

            {/* Sélection de quantité */}
            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Quantité</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.quantityButtonDisabled
                  ]}
                  onPress={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <MaterialIcons 
                    name="remove" 
                    size={20} 
                    color={quantity <= 1 ? "#CCC" : "#E31837"} 
                  />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= 99 && styles.quantityButtonDisabled
                  ]}
                  onPress={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 99}
                >
                  <MaterialIcons 
                    name="add" 
                    size={20} 
                    color={quantity >= 99 ? "#CCC" : "#E31837"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Instructions spéciales */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.sectionTitle}>Instructions spéciales (optionnel)</Text>
              <TextInput
                style={styles.instructionsInput}
                placeholder="Ex: Sans oignons, bien cuit, etc."
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.instructionsCounter}>
                {specialInstructions.length}/200
              </Text>
            </View>

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
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>{totalPrice.toLocaleString()} GNF</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isAddingToCart && styles.addToCartButtonDisabled
            ]}
            onPress={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <MaterialIcons name="hourglass-empty" size={20} color="#FFF" />
            ) : (
              <MaterialIcons name="add-shopping-cart" size={20} color="#FFF" />
            )}
            <Text style={styles.addToCartText}>
              {isAddingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
            </Text>
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
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
  quantityContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E31837',
  },
  quantityButtonDisabled: {
    borderColor: '#CCC',
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  instructionsContainer: {
    marginBottom: 16,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  instructionsCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  allergensContainer: {
    marginBottom: 16,
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E31837',
  },
  addToCartButton: {
    backgroundColor: '#E31837',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 