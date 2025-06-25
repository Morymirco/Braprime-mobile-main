import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../lib/contexts/AuthContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, error, convertToOrder } = useCart();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  // Charger les données utilisateur et du panier
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.email?.split('@')[0] || '',
        lastName: '',
        phone: '',
      }));
    }

    if (cart) {
      setFormData(prev => ({
        ...prev,
        address: cart.delivery_address || '',
        notes: cart.delivery_instructions || '',
      }));
      setDeliveryMethod(cart.delivery_method || 'delivery');
    }
  }, [user, cart]);

  // Calculer les totaux
  const cartTotal = cart?.total || 0;
  const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
  const tax = Math.round(cartTotal * 0.15);
  const grandTotal = cartTotal + deliveryFee + tax;

  // Validation du formulaire
  const isFormValid = () => {
    if (!cart || cart.items.length === 0) return false;
    
    const requiredFields = [formData.firstName, formData.lastName, formData.phone];
    if (deliveryMethod === 'delivery') {
      requiredFields.push(formData.address, formData.city);
    }
    
    return requiredFields.every(field => field.trim() !== '');
  };

  // Gérer la soumission de la commande
  const handleSubmitOrder = async () => {
    if (!isFormValid()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: user?.email,
        },
        delivery: {
          method: deliveryMethod,
          address: formData.address,
          city: formData.city,
          instructions: formData.notes,
        },
        payment: {
          method: paymentMethod,
        },
        totals: {
          subtotal: cartTotal,
          deliveryFee,
          tax,
          total: grandTotal,
        }
      };

      const { success, orderId } = await convertToOrder(orderData);
      
      if (success) {
        Alert.alert(
          'Commande confirmée !',
          `Votre commande #${orderId} a été créée avec succès.`,
          [
            {
              text: 'Voir mes commandes',
              onPress: () => router.push('/orders')
            },
            {
              text: 'Retour à l\'accueil',
              onPress: () => router.push('/')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de créer la commande. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la commande.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  // Rediriger vers le panier si pas d'articles
  if (!loading && (!cart || cart.items.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyMessage}>
            Ajoutez des articles à votre panier avant de passer à la caisse.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={20} color="#E31837" />
            <Text style={styles.backButtonText}>Retour au panier</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Chargement...</Text>
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
        <Text style={styles.headerTitle}>Finaliser la commande</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Informations de livraison */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="location-on" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Prénom *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  placeholder="Votre prénom"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Votre nom"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="+224 XXX XXX XXX"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Adresse complète *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Rue, quartier, ville..."
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ville *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                placeholder="Votre ville"
              />
            </View>
          </View>
        </View>

        {/* Options de livraison */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-shipping" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Options de livraison</Text>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                deliveryMethod === 'delivery' && styles.optionButtonActive
              ]}
              onPress={() => setDeliveryMethod('delivery')}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Livraison à domicile</Text>
                <Text style={styles.optionPrice}>+2 000 GNF</Text>
              </View>
              <MaterialIcons
                name={deliveryMethod === 'delivery' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={20}
                color={deliveryMethod === 'delivery' ? '#E31837' : '#666'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                deliveryMethod === 'pickup' && styles.optionButtonActive
              ]}
              onPress={() => setDeliveryMethod('pickup')}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Retrait sur place</Text>
                <Text style={styles.optionPrice}>Gratuit</Text>
              </View>
              <MaterialIcons
                name={deliveryMethod === 'pickup' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={20}
                color={deliveryMethod === 'pickup' ? '#E31837' : '#666'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Méthode de paiement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="credit-card" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Méthode de paiement</Text>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                paymentMethod === 'cash' && styles.optionButtonActive
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Paiement en espèces</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Recommandé</Text>
                </View>
              </View>
              <MaterialIcons
                name={paymentMethod === 'cash' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={20}
                color={paymentMethod === 'cash' ? '#E31837' : '#666'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                paymentMethod === 'mobile_money' && styles.optionButtonActive
              ]}
              onPress={() => setPaymentMethod('mobile_money')}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Mobile Money</Text>
                <Text style={styles.optionSubtitle}>Orange Money, MTN Money</Text>
              </View>
              <MaterialIcons
                name={paymentMethod === 'mobile_money' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={20}
                color={paymentMethod === 'mobile_money' ? '#E31837' : '#666'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                paymentMethod === 'card' && styles.optionButtonActive
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Carte bancaire</Text>
              </View>
              <MaterialIcons
                name={paymentMethod === 'card' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={20}
                color={paymentMethod === 'card' ? '#E31837' : '#666'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes spéciales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="message" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Notes spéciales</Text>
          </View>
          <View style={styles.sectionContent}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="Instructions spéciales pour la livraison, allergies, etc."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Résumé de la commande */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="shopping-cart" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Articles */}
            {cart?.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemQuantity}>
                    {item.quantity} × {(item.price).toLocaleString()} GNF
                  </Text>
                  {item.special_instructions && (
                    <Text style={styles.orderItemNote}>
                      Note: {item.special_instructions}
                    </Text>
                  )}
                </View>
                <Text style={styles.orderItemTotal}>
                  {(item.price * item.quantity).toLocaleString()} GNF
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Calculs */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>{cartTotal.toLocaleString()} GNF</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frais de livraison</Text>
              <Text style={styles.totalValue}>
                {deliveryMethod === 'delivery' ? '2 000 GNF' : 'Gratuit'}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxes</Text>
              <Text style={styles.totalValue}>{tax.toLocaleString()} GNF</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{grandTotal.toLocaleString()} GNF</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bouton de commande */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!isFormValid() || isProcessing) && styles.checkoutButtonDisabled
          ]}
          onPress={handleSubmitOrder}
          disabled={!isFormValid() || isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.checkoutButtonText}>Traitement...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.checkoutButtonText}>
                Confirmer la commande • {grandTotal.toLocaleString()} GNF
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          En passant cette commande, vous acceptez nos conditions générales de vente.
        </Text>
      </View>
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
    lineHeight: 22,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#E31837',
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  sectionContent: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  optionPrice: {
    fontSize: 14,
    color: '#E31837',
    fontWeight: '600',
    marginTop: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#E31837',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderItemNote: {
    fontSize: 12,
    color: '#E31837',
    marginTop: 2,
    fontStyle: 'italic',
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31837',
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkoutButton: {
    backgroundColor: '#E31837',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
}); 