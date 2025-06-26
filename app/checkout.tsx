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
import ToastContainer from '../components/ToastContainer';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../lib/contexts/AuthContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, error, convertToOrder, loadingStates } = useCart();
  const { showToast } = useToast();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money'>('cash');
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
      showToast('error', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

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

      const { success, orderId, error: orderError } = await convertToOrder(orderData);
      
      if (success && orderId) {
        showToast('success', `Commande #${orderId} créée avec succès !`);
        
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
        showToast('error', orderError || 'Impossible de créer la commande. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      showToast('error', 'Une erreur est survenue lors de la création de la commande.');
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
      {/* Toast Container */}
      <ToastContainer />

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
                placeholder="Votre numéro de téléphone"
                keyboardType="phone-pad"
              />
            </View>

            {deliveryMethod === 'delivery' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Adresse *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                    placeholder="Votre adresse complète"
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
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Instructions spéciales</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Instructions de livraison (optionnel)"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Méthode de livraison */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-shipping" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Méthode de livraison</Text>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                deliveryMethod === 'delivery' && styles.optionButtonActive
              ]}
              onPress={() => setDeliveryMethod('delivery')}
            >
              <MaterialIcons 
                name="local-shipping" 
                size={24} 
                color={deliveryMethod === 'delivery' ? '#E31837' : '#666'} 
              />
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  deliveryMethod === 'delivery' && styles.optionTitleActive
                ]}>
                  Livraison à domicile
                </Text>
                <Text style={styles.optionDescription}>
                  Livraison à votre adresse (2 000 GNF)
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                deliveryMethod === 'pickup' && styles.optionButtonActive
              ]}
              onPress={() => setDeliveryMethod('pickup')}
            >
              <MaterialIcons 
                name="store" 
                size={24} 
                color={deliveryMethod === 'pickup' ? '#E31837' : '#666'} 
              />
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  deliveryMethod === 'pickup' && styles.optionTitleActive
                ]}>
                  Retrait en magasin
                </Text>
                <Text style={styles.optionDescription}>
                  Retrait gratuit au commerce
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Méthode de paiement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="payment" size={20} color="#E31837" />
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
              <MaterialIcons 
                name="attach-money" 
                size={24} 
                color={paymentMethod === 'cash' ? '#E31837' : '#666'} 
              />
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  paymentMethod === 'cash' && styles.optionTitleActive
                ]}>
                  Espèces
                </Text>
                <Text style={styles.optionDescription}>
                  Paiement en espèces à la livraison
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                paymentMethod === 'card' && styles.optionButtonActive
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <MaterialIcons 
                name="credit-card" 
                size={24} 
                color={paymentMethod === 'card' ? '#E31837' : '#666'} 
              />
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  paymentMethod === 'card' && styles.optionTitleActive
                ]}>
                  Carte bancaire
                </Text>
                <Text style={styles.optionDescription}>
                  Paiement par carte bancaire
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                paymentMethod === 'mobile_money' && styles.optionButtonActive
              ]}
              onPress={() => setPaymentMethod('mobile_money')}
            >
              <MaterialIcons 
                name="smartphone" 
                size={24} 
                color={paymentMethod === 'mobile_money' ? '#E31837' : '#666'} 
              />
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  paymentMethod === 'mobile_money' && styles.optionTitleActive
                ]}>
                  Mobile Money
                </Text>
                <Text style={styles.optionDescription}>
                  Paiement par Mobile Money
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Résumé de la commande */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="receipt" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{cartTotal.toLocaleString()} GNF</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} GNF</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes (15%)</Text>
              <Text style={styles.summaryValue}>{tax.toLocaleString()} GNF</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{grandTotal.toLocaleString()} GNF</Text>
            </View>
          </View>
        </View>

        {/* Bouton de confirmation */}
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!isFormValid() || loadingStates.convertToOrder) && styles.confirmButtonDisabled
            ]}
            onPress={handleSubmitOrder}
            disabled={!isFormValid() || loadingStates.convertToOrder}
          >
            {loadingStates.convertToOrder ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialIcons name="check-circle" size={24} color="#FFF" />
            )}
            <Text style={styles.confirmButtonText}>
              {loadingStates.convertToOrder ? 'Création en cours...' : 'Confirmer la commande'}
            </Text>
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
  optionTitleActive: {
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
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
    color: '#000',
    fontWeight: '500',
  },
  confirmContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#E31837',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
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