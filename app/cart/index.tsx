import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartSkeleton from '../../components/CartSkeleton';
import ToastContainer from '../../components/ToastContainer';
import { useCart } from '../../hooks/use-cart';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useToast } from '../../lib/contexts/ToastContext';
import { MenuItemWithCategory } from '../../lib/services/MenuService';

// Types
interface Promo {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minAmount?: number;
}

// Composant personnalisé pour les détails d'article du panier
interface CartItemDetailProps {
  item: any;
  visible: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

function CartItemDetail({ item, visible, onClose, onUpdateQuantity, onRemove }: CartItemDetailProps) {
  const [quantity, setQuantity] = useState(item?.quantity || 1);

  if (!item) return null;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      // Mise à jour optimiste immédiate
      setQuantity(newQuantity);
      
      // Mise à jour en arrière-plan sans bloquer l'interface
      onUpdateQuantity(item.id, newQuantity).catch((error) => {
        // En cas d'erreur, on peut afficher un toast mais ne pas bloquer l'interface
        console.error('Erreur lors de la mise à jour de la quantité:', error);
      });
    }
  };

  const handleRemove = async () => {
    try {
      await onRemove(item.id);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const totalPrice = item.price * quantity;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Détails de l'article</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Image */}
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.modalImage}
              resizeMode="cover"
            />
          )}

          {/* Informations principales */}
          <View style={styles.modalMainInfo}>
            <Text style={styles.modalTitle}>{item.name}</Text>
            <Text style={styles.modalPrice}>{item.price.toLocaleString()} GNF</Text>

            {item.description && (
              <Text style={styles.modalDescription}>{item.description}</Text>
            )}

            {/* Quantité actuelle */}
            <View style={styles.modalQuantitySection}>
              <Text style={styles.modalSectionTitle}>Quantité dans le panier</Text>
              <View style={styles.modalQuantitySelector}>
                <TouchableOpacity
                  style={[
                    styles.modalQuantityButton,
                    quantity <= 1 && styles.modalQuantityButtonDisabled
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
                
                <Text style={styles.modalQuantityText}>
                  {quantity}
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.modalQuantityButton,
                    quantity >= 99 && styles.modalQuantityButtonDisabled
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
            {item.special_instructions && (
              <View style={styles.modalInstructionsSection}>
                <Text style={styles.modalSectionTitle}>Instructions spéciales</Text>
                <Text style={styles.modalInstructionsText}>
                  {item.special_instructions}
                </Text>
              </View>
            )}

            {/* Informations du commerce */}
            <View style={styles.modalBusinessSection}>
              <Text style={styles.modalSectionTitle}>Commerce</Text>
              <View style={styles.modalBusinessInfo}>
                <MaterialIcons name="store" size={16} color="#666" />
                <Text style={styles.modalBusinessName}>
                  {item.business_name || 'Commerce'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.modalActionContainer}>
          <View style={styles.modalTotalContainer}>
            <Text style={styles.modalTotalLabel}>Total:</Text>
            <Text style={styles.modalTotalPrice}>{totalPrice.toLocaleString()} GNF</Text>
          </View>
          
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={styles.modalRemoveButton}
              onPress={handleRemove}
            >
              <MaterialIcons name="delete-outline" size={20} color="#E31837" />
              <Text style={styles.modalRemoveButtonText}>Supprimer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithCategory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

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

  const handleMenuItemPress = (item: any) => {
    setSelectedMenuItem(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMenuItem(null);
  };

  const handleModalUpdateQuantity = async (itemId: string, quantity: number) => {
    // Mise à jour optimiste - on ne bloque pas l'interface
    updateQuantity(itemId, quantity).catch((error) => {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      showToast('error', 'Erreur lors de la mise à jour de la quantité');
    });
  };

  const handleModalRemove = async (itemId: string) => {
    const { success, error } = await removeFromCart(itemId);
    if (success) {
      showToast('success', 'Article supprimé du panier');
    } else {
      showToast('error', error || 'Impossible de supprimer l\'article');
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleModalRemove(itemId);
      return;
    }

    // Mise à jour optimiste - on ne bloque pas l'interface
    updateQuantity(itemId, newQuantity).catch((error) => {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      showToast('error', 'Erreur lors de la mise à jour de la quantité');
    });
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
              await handleModalRemove(itemId);
            }
          }
        ]
      );
    } else {
      await handleModalRemove(itemId);
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

  const handleAddToCart = async (item: MenuItemWithCategory, quantity: number, specialInstructions?: string) => {
    // Cette fonction ne sera pas utilisée dans le contexte du panier
    // car on ne peut pas ajouter depuis le modal dans le panier
    showToast('info', 'Utilisez les boutons +/- pour modifier la quantité');
  };

  // Fonction pour appliquer un code promo (simulation)
  const applyPromo = async (code: string): Promise<Promo | null> => {
    // Simulation d'une API de codes promo
    const promoCodes: Record<string, Promo> = {
      'WELCOME10': { code: 'WELCOME10', discount: 10000, type: 'fixed', minAmount: 50000 },
      'SAVE20': { code: 'SAVE20', discount: 20, type: 'percentage', minAmount: 25000 },
      'FREESHIP': { code: 'FREESHIP', discount: 5000, type: 'fixed', minAmount: 100000 },
      'NEWUSER': { code: 'NEWUSER', discount: 15000, type: 'fixed', minAmount: 30000 },
    };

    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));

    const promo = promoCodes[code.toUpperCase()];
    if (!promo) {
      return null;
    }

    // Vérifier le montant minimum
    const total = getTotal();
    if (promo.minAmount && total < promo.minAmount) {
      throw new Error(`Montant minimum requis: ${promo.minAmount.toLocaleString()} GNF`);
    }

    // Calculer la réduction
    let discount = promo.discount;
    if (promo.type === 'percentage') {
      discount = Math.round(total * (promo.discount / 100));
    }

    return {
      ...promo,
      discount
    };
  };

  const handleApplyPromo = async () => {
    setIsApplyingPromo(true);
    try {
      const promo = await applyPromo(promoCode);
      if (promo) {
        setAppliedPromo(promo);
        setPromoCode('');
        showToast('success', `Code promo appliqué ! Réduction de ${promo.discount.toLocaleString()} GNF`);
      } else {
        showToast('error', 'Code promo invalide');
      }
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Erreur lors de l\'application du code promo');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast('success', 'Code promo supprimé');
  };

  const getFinalTotal = () => {
    let total = getTotal() + (cart?.delivery_fee || 0);
    if (appliedPromo) {
      total -= appliedPromo.discount;
    }
    return Math.max(0, total); // Éviter un total négatif
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
        </View>
        <Text style={styles.subtitle}>
          {getItemCount()} article{getItemCount() !== 1 ? 's' : ''} • {
            cart?.is_multi_service && cart.businesses && cart.businesses.length > 0 
              ? `${cart.businesses.length} service${cart.businesses.length > 1 ? 's' : ''}`
              : cart?.business_name || 'Service'
          }
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
          {(() => {
            // Log de débogage pour voir la structure du panier
            console.log('🛒 Structure du panier:', {
              isMultiService: cart?.is_multi_service,
              businesses: cart?.businesses,
              totalItems: cart?.items?.length,
              items: cart?.items?.map(item => ({
                id: item.id,
                name: item.name,
                business_id: item.business_id,
                business_name: item.business_name,
                price: item.price,
                quantity: item.quantity
              })),
              businessesDetails: cart?.businesses?.map(business => ({
                id: business.id,
                name: business.name,
                item_count: business.item_count,
                total: business.total
              }))
            });
            
            if (cart?.is_multi_service && cart.businesses && cart.businesses.length > 0) {
              // Affichage multi-services organisé par business
              return cart.businesses.map((business) => (
                <View key={business.id} style={styles.businessSection}>
                  {/* En-tête du business */}
                  <View style={styles.businessHeader}>
                    <View style={styles.businessInfo}>
                      <MaterialIcons name="store" size={20} color="#E31837" />
                      <Text style={styles.businessName}>{business.name}</Text>
                    </View>
                    <View style={styles.businessSummary}>
                      <Text style={styles.businessItemCount}>
                        {business.item_count} article{business.item_count !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.businessTotal}>
                        {business.total.toLocaleString()} GNF
                      </Text>
                    </View>
                  </View>
                  
                  {/* Articles de ce business */}
                  {(() => {
                    // Pour le panier multi-service, filtrer les articles par business
                    const businessItems = cart.items && cart.items.length > 0 ? 
                      cart.items.filter(item => {
                        // Log détaillé pour chaque article
                        console.log(`🔍 Article "${item.name}":`, {
                          itemBusinessId: item.business_id,
                          itemBusinessName: item.business_name,
                          businessId: business.id,
                          businessName: business.name
                        });
                        
                        // Vérifier si l'article appartient à ce business
                        const matches = item.business_id === business.id;
                        
                        if (matches) {
                          console.log(`✅ Match: ${item.name} -> ${business.name}`);
                        } else {
                          console.log(`❌ Pas de match: ${item.name} (${item.business_id}) -> ${business.name} (${business.id})`);
                        }
                        
                        return matches;
                      }) : [];
                    
                    console.log(`📦 Business "${business.name}" (ID: ${business.id}):`, {
                      totalItems: cart.items?.length || 0,
                      filteredItems: businessItems.length,
                      businessItems: businessItems.map(item => ({ id: item.id, name: item.name, business_id: item.business_id, business_name: item.business_name }))
                    });
                    
                    if (businessItems.length === 0) {
                      return (
                        <View style={styles.noItemsContainer}>
                          <Text style={styles.noItemsText}>Aucun article trouvé pour ce service</Text>
                        </View>
                      );
                    }
                    
                    return businessItems.map((item) => {
            const isUpdatingQuantity = loadingStates.updateQuantity[item.id];
            const isRemoving = loadingStates.removeFromCart[item.id];
            
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.itemCard}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
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
                      onPress={(e) => {
                                  e.stopPropagation();
                        handleRemoveItem(item.id, item.name);
                      }}
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
                          item.quantity <= 1 && styles.quantityButtonDisabled
                        ]}
                        onPress={(e) => {
                                    e.stopPropagation();
                          handleQuantityChange(item.id, item.quantity - 1);
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <MaterialIcons 
                          name="remove" 
                          size={20} 
                          color={item.quantity <= 1 ? "#CCC" : "#E31837"} 
                        />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>
                        {item.quantity}
                      </Text>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={(e) => {
                                    e.stopPropagation();
                          handleQuantityChange(item.id, item.quantity + 1);
                        }}
                      >
                        <MaterialIcons 
                          name="add" 
                          size={20} 
                          color="#E31837" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
                    });
                  })()}
                </View>
              ));
            } else {
              // Affichage simple pour un seul service
              if (cart?.items && cart.items.length > 0) {
                return cart.items.map((item) => {
                  const isUpdatingQuantity = loadingStates.updateQuantity[item.id];
                  const isRemoving = loadingStates.removeFromCart[item.id];
                  
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.itemCard}
                      onPress={() => handleMenuItemPress(item)}
                      activeOpacity={0.7}
                    >
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
                            onPress={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id, item.name);
                            }}
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
                                item.quantity <= 1 && styles.quantityButtonDisabled
                              ]}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item.id, item.quantity - 1);
                              }}
                              disabled={item.quantity <= 1}
                            >
                              <MaterialIcons 
                                name="remove" 
                                size={20} 
                                color={item.quantity <= 1 ? "#CCC" : "#E31837"} 
                              />
                            </TouchableOpacity>
                            
                            <Text style={styles.quantityText}>
                              {item.quantity}
                            </Text>
                            
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item.id, item.quantity + 1);
                              }}
                            >
                              <MaterialIcons 
                                name="add" 
                                size={20} 
                                color="#E31837" 
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                });
              } else {
                return (
                  <View style={styles.emptyCartContainer}>
                    <MaterialIcons name="shopping-cart-outline" size={64} color="#CCC" />
                    <Text style={styles.emptyCartTitle}>Votre panier est vide</Text>
                    <Text style={styles.emptyCartSubtitle}>
                      Ajoutez des articles pour commencer vos achats
                    </Text>
                  </View>
                );
              }
            }
          })()}
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

        {/* Section Code Promo */}
        <View style={styles.promoContainer}>
          <View style={styles.promoHeader}>
            <MaterialIcons name="local-offer" size={20} color="#E31837" />
            <Text style={styles.promoTitle}>Code promo</Text>
          </View>
          
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Entrez votre code promo"
              placeholderTextColor="#999"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[
                styles.applyPromoButton,
                !promoCode.trim() && styles.applyPromoButtonDisabled
              ]}
              onPress={handleApplyPromo}
              disabled={!promoCode.trim() || isApplyingPromo}
            >
              {isApplyingPromo ? (
                <MaterialIcons name="hourglass-empty" size={16} color="#FFF" />
              ) : (
                <Text style={styles.applyPromoText}>Appliquer</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {appliedPromo && (
            <View style={styles.appliedPromoContainer}>
              <View style={styles.appliedPromoInfo}>
                <MaterialIcons name="check-circle" size={16} color="#00C853" />
                <Text style={styles.appliedPromoText}>
                  Code {appliedPromo.code} appliqué
                </Text>
                <Text style={styles.appliedPromoDiscount}>
                  -{appliedPromo.discount} GNF
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removePromoButton}
                onPress={handleRemovePromo}
              >
                <MaterialIcons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
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
          
          {appliedPromo && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Réduction promo</Text>
              <Text style={[styles.summaryValue, styles.promoDiscountValue]}>
                -{appliedPromo.discount.toLocaleString()} GNF
              </Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {getFinalTotal().toLocaleString()} GNF
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

      {/* Modal de détail de l'article */}
      <CartItemDetail
        item={selectedMenuItem}
        visible={modalVisible}
        onClose={handleCloseModal}
        onUpdateQuantity={handleModalUpdateQuantity}
        onRemove={handleModalRemove}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontWeight: '600',
    color: '#333',
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
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#E31837',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  checkoutButtonLoading: {
    backgroundColor: '#CCC',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
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
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalMainInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E31837',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  modalQuantitySection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalQuantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
  },
  modalQuantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E31837',
  },
  modalQuantityButtonDisabled: {
    borderColor: '#CCC',
    backgroundColor: '#f0f0f0',
  },
  modalQuantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  modalInstructionsSection: {
    marginBottom: 16,
  },
  modalInstructionsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  modalBusinessSection: {
    marginBottom: 16,
  },
  modalBusinessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  modalBusinessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  modalActionContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E31837',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalRemoveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#E31837',
  },
  modalRemoveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalCloseButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCloseButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  promoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  promoInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  applyPromoButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E31837',
  },
  applyPromoButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  applyPromoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedPromoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedPromoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  appliedPromoDiscount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  removePromoButton: {
    padding: 4,
  },
  promoDiscountValue: {
    fontWeight: 'bold',
    color: '#E31837',
  },
  businessSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  businessSummary: {
    alignItems: 'flex-end',
  },
  businessItemCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  businessTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31837',
  },
  noItemsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noItemsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyCartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
}); 