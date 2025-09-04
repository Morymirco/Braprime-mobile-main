import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useCartContext } from '../lib/contexts/CartContext';
import { AddToCartItem } from '../lib/services/CartService';

interface AddToCartButtonProps {
  item: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
  businessId: number;
  businessName: string;
  quantity?: number;
  specialInstructions?: string;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  item,
  businessId,
  businessName,
  quantity = 1,
  specialInstructions,
  style,
  textStyle,
  disabled = false,
  showIcon = true,
  size = 'medium',
}) => {
  const { addToCart, loading } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    setIsAdding(true);

    try {
      const cartItem: AddToCartItem = {
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: quantity,
        image: item.image,
        special_instructions: specialInstructions,
      };

      await addToCart(cartItem, businessId);
      
      // Afficher un message de succès
      Alert.alert(
        'Ajouté au panier',
        `${item.name} a été ajouté à votre panier.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter l\'article au panier. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAdding(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonSize(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={handleAddToCart}
      disabled={disabled || isAdding || loading}
      activeOpacity={0.7}
    >
      {isAdding || loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={[styles.buttonText, getTextSize(), textStyle]}>
            Ajout...
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {showIcon && (
            <MaterialIcons
              name="add-shopping-cart"
              size={getIconSize()}
              color="#fff"
              style={styles.icon}
            />
          )}
          <Text style={[styles.buttonText, getTextSize(), textStyle]}>
            Ajouter au panier
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E31837',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  icon: {
    marginRight: 6,
  },
});

export default AddToCartButton;
