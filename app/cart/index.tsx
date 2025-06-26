import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartSkeleton from '../../components/CartSkeleton';
import SyncStatus from '../../components/SyncStatus';
import ToastContainer from '../../components/ToastContainer';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../lib/contexts/AuthContext';

export default function CartScreen() {
  const { user } = useAuth();
  const { 
    cart, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    refetch,
    getTotal,
    getItemCount,
    isEmpty,
    loadingStates
  } = useCart();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      showToast('success', 'Panier actualisé');
    } catch (error) {
      showToast('error', 'Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId, '');
      return;
    }

    const { success, error } = await updateQuantity(itemId, newQuantity);
    if (!success) {
      showToast('error', error || 'Impossible de mettre à jour la quantité');
    }
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    if (itemName) {
      Alert.alert(
        'Supprimer l\'article',
        `Voulez-vous supprimer "${itemName}" du panier ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              const { success, error } = await removeFromCart(itemId);
              if (success) {
                showToast('success', 'Article supprimé du panier');
              } else {
                showToast('error', error || 'Impossible de supprimer l\'article');
              }
            }
          }
        ]
      );
    } else {
      const { success, error } = await removeFromCart(itemId);
      if (!success) {
        showToast('error', error || 'Impossible de supprimer l\'article');
      }
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Vider le panier',
      'Voulez-vous vraiment vider tout le panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await clearCart();
            if (success) {
              showToast('success', 'Panier vidé');
            } else {
              showToast('error', error || 'Impossible de vider le panier');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (isEmpty()) {
      showToast('error', 'Votre panier est vide');
      return;
    }
    router.push('/checkout');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="shopping-cart" size={64} color="#CCC" />
          <Text style={styles.errorTitle}>Connexion requise</Text>
          <Text style={styles.errorMessage}>
            Vous devez être connecté pour accéder à votre panier.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <CartSkeleton count={3} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#E31837" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isEmpty()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyMessage}>
            Ajoutez des articles à votre panier pour commencer vos achats.
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseButtonText}>Parcourir les commerces</Text>
          </TouchableOpacity>
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
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mon Panier</Text>
          <SyncStatus showDetails={false} />
        </View>
        <Text style={styles.subtitle}>
          {getItemCount()} article{getItemCount() !== 1 ? 's' : ''} • {cart?.business_name}
        </Text>
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
        {/* Articles du panier */}
        <View style={styles.itemsContainer}>
          {cart?.items.map((item) => {
            const isUpdatingQuantity = loadingStates.updateQuantity[item.id];
            const isRemoving = loadingStates.removeFromCart[item.id];
            
            return (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{
                    uri: item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&q=80'
                  }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id, item.name)}
                      style={[
                        styles.removeButton,
                        isRemoving && styles.removeButtonLoading
                      ]}
                      disabled={isRemoving}
                    >
                      {isRemoving ? (
                        <MaterialIcons name="hourglass-empty" size={20} color="#CCC" />
                      ) : (
                        <MaterialIcons name="delete-outline" size={20} color="#E31837" />
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  {item.special_instructions && (
                    <Text style={styles.itemInstructions} numberOfLines={2}>
                      {item.special_instructions}
                    </Text>
                  )}

                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>
                      {(item.price * item.quantity).toLocaleString()} GNF
                    </Text>
                    
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          (item.quantity <= 1 || isUpdatingQuantity) && styles.quantityButtonDisabled
                        ]}
                        onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdatingQuantity}
                      >
                        <MaterialIcons 
                          name="remove" 
                          size={20} 
                          color={item.quantity <= 1 || isUpdatingQuantity ? "#CCC" : "#E31837"} 
                        />
                      </TouchableOpacity>
                      
                      <Text style={[
                        styles.quantityText,
                        isUpdatingQuantity && styles.quantityTextLoading
                      ]}>
                        {isUpdatingQuantity ? '...' : item.quantity}
                      </Text>
                      
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          isUpdatingQuantity && styles.quantityButtonDisabled
                        ]}
                        onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isUpdatingQuantity}
                      >
                        <MaterialIcons 
                          name="add" 
                          size={20} 
                          color={isUpdatingQuantity ? "#CCC" : "#E31837"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.clearButton,
              loadingStates.clearCart && styles.clearButtonLoading
            ]}
            onPress={handleClearCart}
            disabled={loadingStates.clearCart}
          >
            {loadingStates.clearCart ? (
              <MaterialIcons name="hourglass-empty" size={20} color="#CCC" />
            ) : (
              <MaterialIcons name="delete-sweep" size={20} color="#E31837" />
            )}
            <Text style={[
              styles.clearButtonText,
              loadingStates.clearCart && styles.clearButtonTextLoading
            ]}>
              {loadingStates.clearCart ? 'Vidage...' : 'Vider le panier'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Résumé */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{getTotal().toLocaleString()} GNF</Text>
          </View>
          
          {cart?.delivery_fee && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>{cart.delivery_fee.toLocaleString()} GNF</Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {((getTotal() + (cart?.delivery_fee || 0))).toLocaleString()} GNF
            </Text>
          </View>
        </View>

        {/* Bouton de commande */}
        <View style={styles.checkoutContainer}>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              loadingStates.addToCart && styles.checkoutButtonLoading
            ]}
            onPress={handleCheckout}
            disabled={loadingStates.addToCart}
          >
            <MaterialIcons name="shopping-cart-checkout" size={24} color="#FFF" />
            <Text style={styles.checkoutButtonText}>Passer la commande</Text>
          </TouchableOpacity>
        </View>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonLoading: {
    opacity: 0.5,
  },
  itemInstructions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31837',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  quantityTextLoading: {
    color: '#CCC',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E31837',
  },
  clearButtonLoading: {
    borderColor: '#CCC',
    backgroundColor: '#f5f5f5',
  },
  clearButtonText: {
    color: '#E31837',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearButtonTextLoading: {
    color: '#CCC',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31837',
  },
  checkoutContainer: {
    padding: 16,
    marginBottom: 16,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E31837',
    paddingVertical: 16,
    borderRadius: 8,
  },
  checkoutButtonLoading: {
    backgroundColor: '#CCC',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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