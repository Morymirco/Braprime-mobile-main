import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useCartContext } from '../lib/contexts/CartContext';

interface CartSummaryProps {
  style?: any;
  showItems?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  style,
  showItems = true,
  showActions = true,
  compact = false,
}) => {
  const { currentCart, removeFromCart, updateQuantity } = useCartContext();
  const router = useRouter();

  if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <MaterialIcons name="shopping-cart" size={48} color="#ccc" />
        <Text style={styles.emptyText}>Votre panier est vide</Text>
        <Text style={styles.emptySubtext}>
          Ajoutez des articles pour commencer vos achats
        </Text>
      </View>
    );
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <View style={[styles.container, style]}>
      {!compact && (
        <View style={styles.header}>
          <Text style={styles.title}>Résumé du panier</Text>
          <Text style={styles.itemCount}>
            {currentCart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} article{(currentCart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0) > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {showItems && (
        <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
          {currentCart.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.business_name && (
                  <Text style={styles.businessName}>{item.business_name}</Text>
                )}
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString()} GNF
                </Text>
              </View>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  <MaterialIcons name="remove" size={16} color="#E31837" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <MaterialIcons name="add" size={16} color="#E31837" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id)}
              >
                <MaterialIcons name="delete" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {(currentCart.total || 0).toLocaleString()} GNF
          </Text>
        </View>

        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={handleViewCart}
            >
              <MaterialIcons name="shopping-cart" size={20} color="#E31837" />
              <Text style={styles.viewCartText}>Voir le panier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <MaterialIcons name="payment" size={20} color="#fff" />
              <Text style={styles.checkoutText}>Commander</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  itemsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#E31837',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E31837',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E31837',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  viewCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E31837',
    backgroundColor: '#fff',
  },
  viewCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E31837',
    marginLeft: 6,
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E31837',
  },
  checkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
});

export default CartSummary;