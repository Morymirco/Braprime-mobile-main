import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastContainer from '../components/ToastContainer';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../lib/contexts/AuthContext';
import { type OrderData, type PaymentMethod } from '../lib/services/OrderService';

const { width } = Dimensions.get('window');

export default function CheckoutScreen() {
  console.log('🛒 CheckoutScreen: Component mounted');
  
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, error, convertToOrder, loadingStates } = useCart();
  const { showToast } = useToast();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryType, setDeliveryType] = useState<'asap' | 'scheduled'>('asap');
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'orange_money' | 'mtn_money' | 'card'>('cash');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    neighborhood: '',
    landmark: '',
    instructions: ''
  });

  // Méthodes de paiement disponibles (adaptées au schéma)
  const availablePaymentMethods: PaymentMethod[] = [
    {
      id: 1,
      name: 'cash',
      icon: '💵',
      description: 'Paiement à la livraison',
      is_available: true
    },
    {
      id: 2,
      name: 'orange_money',
      icon: '🟠',
      description: 'Orange Money',
      is_available: true
    },
    {
      id: 3,
      name: 'mtn_money',
      icon: '🟡',
      description: 'MTN Money',
      is_available: true
    },
    {
      id: 4,
      name: 'card',
      icon: '💳',
      description: 'Carte bancaire',
      is_available: true
    }
  ];

  // Charger les données utilisateur et du panier (une seule fois au montage)
  useEffect(() => {
    if (isInitialized) return; // Éviter les réinitialisations multiples
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.full_name || user.email?.split('@')[0] || '',
        phone: prev.phone || user.phone || '',
      }));
    }

    if (cart) {
      setFormData(prev => ({
        ...prev,
        address: prev.address || cart.delivery_address || '',
        instructions: prev.instructions || cart.delivery_instructions || '',
      }));
      // Ne changer le mode de livraison que s'il n'est pas déjà défini
      if (!deliveryMethod) {
        setDeliveryMethod(cart.delivery_method || 'delivery');
      }
    }
    
    setIsInitialized(true);
  }, [user, cart, isInitialized]); // Inclure isInitialized pour éviter les boucles

  // Gérer le changement de date/heure
  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    setShowDateTimePicker(false);
    if (selectedDate) {
      setSelectedDateTime(selectedDate);
    }
  };

  // Formater la date pour l'affichage
  const formatSelectedDateTime = () => {
    if (deliveryType === 'asap') {
      return 'Dès que possible';
    }
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (selectedDateTime.toDateString() === now.toDateString()) {
      return `Aujourd'hui à ${selectedDateTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (selectedDateTime.toDateString() === tomorrow.toDateString()) {
      return `Demain à ${selectedDateTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return selectedDateTime.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Validation de la date sélectionnée
  const isDateTimeValid = () => {
    if (deliveryType === 'asap') return true;
    
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 30 * 60000); // 30 minutes minimum
    
    return selectedDateTime >= minDateTime;
  };

  // Calculer les totaux
  const cartTotal = cart?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  const deliveryFee = deliveryMethod === 'delivery' ? 15000 : 0;
  const tax = Math.round(cartTotal * 0.18); // 18% TVA
  const grandTotal = cartTotal + deliveryFee + tax;

  // Validation du formulaire
  const isFormValid = () => {
    if (!cart || cart.items.length === 0) return false;
    
    const requiredFields = [formData.fullName, formData.phone];
    
    if (deliveryMethod === 'delivery') {
      // Valider les champs d'adresse manuels
      const addressFields = [formData.address, formData.neighborhood];
      if (!addressFields.every(field => field.trim() !== '')) {
        return false;
      }
    }
    
    // Valider la date/heure pour les livraisons programmées
    if (deliveryType === 'scheduled' && !isDateTimeValid()) {
      return false;
    }
    
    return requiredFields.every(field => field.trim() !== '');
  };

  // Gérer la soumission de la commande
  const handleSubmitOrder = async () => {
    if (!isFormValid()) {
      if (deliveryType === 'scheduled' && !isDateTimeValid()) {
        showToast('error', 'Veuillez sélectionner une date/heure valide (minimum 30 minutes).');
        return;
      }
      showToast('error', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!user?.id) {
      showToast('error', 'Vous devez être connecté pour passer une commande.');
      return;
    }

    try {
      // Préparer les données de commande selon le schéma de base de données
      const orderData: OrderData = {
        user_id: user.id,
        business_id: cart?.business_id,
        business_name: cart?.business_name || 'Commerce',
        items: cart?.items || [],
        status: 'pending',
        total: cartTotal,
        delivery_fee: deliveryFee,
        tax,
        grand_total: grandTotal,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'delivery' ? `${formData.address}, ${formData.neighborhood}` : undefined,
        delivery_instructions: formData.instructions || undefined,
        payment_method: paymentMethod,
        payment_status: 'pending',
        // Nouveaux champs pour la livraison programmée
        preferred_delivery_time: deliveryType === 'scheduled' ? selectedDateTime.toISOString() : undefined,
        delivery_type: deliveryType,
        // Coordonnées temporairement désactivées
        pickup_coordinates: undefined,
        delivery_coordinates: undefined,
      };

      const { success, orderId, error: orderError } = await convertToOrder(orderData);
      
      if (success && orderId) {
        const deliveryMessage = deliveryType === 'scheduled' 
          ? `Commande #${orderId} programmée pour ${formatSelectedDateTime()} !`
          : `Commande #${orderId} créée avec succès !`;
        
        showToast('success', deliveryMessage);
        
        // Rediriger vers la page de succès
        router.push(`/order-success?orderId=${orderId}`);
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Mode de livraison */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-shipping" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Mode de livraison</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.deliveryOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.deliveryOptionCard,
                  deliveryMethod === 'delivery' && styles.deliveryOptionCardActive
                ]}
                onPress={() => setDeliveryMethod('delivery')}
              >
                <View style={styles.deliveryOptionHeader}>
                  <View style={styles.deliveryOptionIcon}>
                    <MaterialIcons 
                      name="local-shipping" 
                      size={24} 
                      color={deliveryMethod === 'delivery' ? '#E31837' : '#666'} 
                    />
                  </View>
                  <View style={styles.deliveryOptionRadio}>
                    <View style={[
                      styles.radioButton,
                      deliveryMethod === 'delivery' && styles.radioButtonActive
                    ]}>
                      {deliveryMethod === 'delivery' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.deliveryOptionContent}>
                  <Text style={[
                    styles.deliveryOptionTitle,
                    deliveryMethod === 'delivery' && styles.deliveryOptionTitleActive
                  ]}>
                    Livraison
                  </Text>
                  <Text style={styles.deliveryOptionPrice}>
                    {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} GNF` : 'Frais inclus'}
                  </Text>
                  <Text style={styles.deliveryOptionDescription}>
                    Livraison à domicile
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deliveryOptionCard,
                  deliveryMethod === 'pickup' && styles.deliveryOptionCardActive
                ]}
                onPress={() => setDeliveryMethod('pickup')}
              >
                <View style={styles.deliveryOptionHeader}>
                  <View style={styles.deliveryOptionIcon}>
                    <MaterialIcons 
                      name="store" 
                      size={24} 
                      color={deliveryMethod === 'pickup' ? '#E31837' : '#666'} 
                    />
                  </View>
                  <View style={styles.deliveryOptionRadio}>
                    <View style={[
                      styles.radioButton,
                      deliveryMethod === 'pickup' && styles.radioButtonActive
                    ]}>
                      {deliveryMethod === 'pickup' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.deliveryOptionContent}>
                  <Text style={[
                    styles.deliveryOptionTitle,
                    deliveryMethod === 'pickup' && styles.deliveryOptionTitleActive
                  ]}>
                    À emporter
                  </Text>
                  <Text style={styles.deliveryOptionPrice}>
                    Aucun frais supplémentaire
                  </Text>
                  <Text style={styles.deliveryOptionDescription}>
                    Récupérez votre commande sur place
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Type de livraison - Seulement si livraison */}
        {deliveryMethod === 'delivery' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="schedule" size={20} color="#E31837" />
              <Text style={styles.sectionTitle}>Type de livraison</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.deliveryTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.deliveryTypeCard,
                    deliveryType === 'asap' && styles.deliveryTypeCardActive
                  ]}
                  onPress={() => setDeliveryType('asap')}
                >
                  <View style={styles.deliveryTypeHeader}>
                    <View style={styles.deliveryTypeIcon}>
                      <MaterialIcons 
                        name="flash-on" 
                        size={24} 
                        color={deliveryType === 'asap' ? '#E31837' : '#666'} 
                      />
                    </View>
                    <View style={styles.deliveryTypeRadio}>
                      <View style={[
                        styles.radioButton,
                        deliveryType === 'asap' && styles.radioButtonActive
                      ]}>
                        {deliveryType === 'asap' && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.deliveryTypeContent}>
                    <Text style={[
                      styles.deliveryTypeTitle,
                      deliveryType === 'asap' && styles.deliveryTypeTitleActive
                    ]}>
                      Dès que possible
                    </Text>
                    <Text style={styles.deliveryTypeDescription}>
                      Livraison en 30-60 minutes
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deliveryTypeCard,
                    deliveryType === 'scheduled' && styles.deliveryTypeCardActive
                  ]}
                  onPress={() => setDeliveryType('scheduled')}
                >
                  <View style={styles.deliveryTypeHeader}>
                    <View style={styles.deliveryTypeIcon}>
                      <MaterialIcons 
                        name="event" 
                        size={24} 
                        color={deliveryType === 'scheduled' ? '#E31837' : '#666'} 
                      />
                    </View>
                    <View style={styles.deliveryTypeRadio}>
                      <View style={[
                        styles.radioButton,
                        deliveryType === 'scheduled' && styles.radioButtonActive
                      ]}>
                        {deliveryType === 'scheduled' && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.deliveryTypeContent}>
                    <Text style={[
                      styles.deliveryTypeTitle,
                      deliveryType === 'scheduled' && styles.deliveryTypeTitleActive
                    ]}>
                      Livraison programmée
                    </Text>
                    <Text style={styles.deliveryTypeDescription}>
                      Choisissez votre date et heure
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Sélection de date/heure pour les livraisons programmées */}
              {deliveryType === 'scheduled' && (
                <View style={styles.dateTimeSection}>
                  <View style={styles.dateTimeHeader}>
                    <MaterialIcons name="access-time" size={20} color="#E31837" />
                    <Text style={styles.dateTimeTitle}>Date et heure de livraison</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.dateTimeButton,
                      !isDateTimeValid() && styles.dateTimeButtonError
                    ]}
                    onPress={() => setShowDateTimePicker(true)}
                  >
                    <View style={styles.dateTimeButtonContent}>
                      <MaterialIcons name="event" size={20} color="#666" />
                      <Text style={[
                        styles.dateTimeButtonText,
                        !isDateTimeValid() && styles.dateTimeButtonTextError
                      ]}>
                        {formatSelectedDateTime()}
                      </Text>
                      <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                  
                  {!isDateTimeValid() && deliveryType === 'scheduled' && (
                    <Text style={styles.dateTimeErrorText}>
                      Veuillez sélectionner une date/heure valide (minimum 30 minutes)
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom complet *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                  placeholder="Votre nom complet"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="+224 XXX XX XX XX"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Adresse de livraison - Seulement si livraison */}
        {deliveryMethod === 'delivery' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={20} color="#E31837" />
              <Text style={styles.sectionTitle}>Adresse de livraison</Text>
            </View>
            <View style={styles.sectionContent}>
              {/* Adresse manuelle temporaire */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Adresse de livraison *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="Entrez votre adresse complète"
                  multiline
                  numberOfLines={2}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quartier *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.neighborhood}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, neighborhood: text }))}
                  placeholder="Ex: Kaloum, Almamya, Ratoma..."
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Point de repère (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.landmark}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, landmark: text }))}
                  placeholder="Ex: Près de la station Total, bâtiment rouge..."
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Instructions de livraison</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.instructions}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, instructions: text }))}
                  placeholder="Instructions spéciales pour le livreur"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
        )}

        {/* Mode de paiement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="payment" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Mode de paiement</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.paymentOptionsContainer}>
              {availablePaymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === method.name && styles.paymentOptionCardActive
                  ]}
                  onPress={() => setPaymentMethod(method.name as any)}
                  disabled={!method.is_available}
                >
                  <View style={styles.paymentOptionHeader}>
                    <View style={styles.paymentOptionIcon}>
                      <Text style={styles.paymentEmoji}>{method.icon}</Text>
                    </View>
                    <View style={styles.paymentOptionRadio}>
                      <View style={[
                        styles.radioButton,
                        paymentMethod === method.name && styles.radioButtonActive
                      ]}>
                        {paymentMethod === method.name && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.paymentOptionContent}>
                    <Text style={[
                      styles.paymentOptionTitle,
                      paymentMethod === method.name && styles.paymentOptionTitleActive
                    ]}>
                      {method.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Espace pour le bouton de confirmation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* DateTimePicker Modal */}
      {showDateTimePicker && (
        <DateTimePicker
          value={selectedDateTime}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateTimeChange}
          minimumDate={new Date(Date.now() + 30 * 60000)} // 30 minutes minimum
          maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60000)} // 7 jours maximum
        />
      )}

      {/* Résumé de commande fixe en bas */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>
          {cart?.business_name && (
            <View style={styles.businessInfo}>
              <MaterialIcons name="store" size={16} color="#4CAF50" />
              <Text style={styles.businessName}>{cart.business_name}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{cartTotal.toLocaleString()} GNF</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>TVA (18%)</Text>
            <Text style={styles.summaryValue}>{tax.toLocaleString()} GNF</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {deliveryMethod === 'delivery' ? 'Frais de livraison' : 'Frais de préparation'}
            </Text>
            <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} GNF</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{grandTotal.toLocaleString()} GNF</Text>
          </View>
        </View>
        
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryInfoContent}>
            <MaterialIcons 
              name={deliveryMethod === 'delivery' ? 'local-shipping' : 'store'} 
              size={16} 
              color="#E31837" 
            />
            <Text style={styles.deliveryInfoText}>
              {deliveryMethod === 'delivery' ? 'Livraison à domicile' : 'À récupérer sur place'}
            </Text>
          </View>
          <Text style={styles.deliveryTimeText}>
            {deliveryMethod === 'delivery' 
              ? 'Livraison estimée: 30-60 minutes' 
              : 'Préparation estimée: 20-30 minutes'}
          </Text>
        </View>

        <View style={styles.actionButtons}>
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
              <MaterialIcons name="shopping-cart-checkout" size={20} color="#FFF" />
            )}
            <Text style={styles.confirmButtonText}>
              {loadingStates.convertToOrder ? 'Traitement...' : 'Passer la commande'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modifyCartButton} onPress={() => router.push('/cart')}>
            <Text style={styles.modifyCartButtonText}>Modifier le panier</Text>
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
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
  deliveryOptionsContainer: {
    gap: 12,
  },
  deliveryOptionCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  deliveryOptionCardActive: {
    borderColor: '#E31837',
    backgroundColor: '#fef2f2',
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deliveryOptionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryOptionRadio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  radioButtonActive: {
    backgroundColor: '#E31837',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  deliveryOptionContent: {
    flex: 1,
  },
  deliveryOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  deliveryOptionTitleActive: {
    color: '#E31837',
  },
  deliveryOptionPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  deliveryOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  paymentOptionsContainer: {
    gap: 12,
  },
  paymentOptionCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  paymentOptionCardActive: {
    borderColor: '#E31837',
    backgroundColor: '#fef2f2',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentOptionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionRadio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  paymentOptionTitleActive: {
    color: '#E31837',
  },
  paymentEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  bottomSpacer: {
    height: 16,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  summaryContent: {
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
    color: '#000',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
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
  deliveryInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  deliveryInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deliveryInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
  },
  deliveryTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 24,
  },
  actionButtons: {
    gap: 12,
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
  modifyCartButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E31837',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modifyCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E31837',
  },
  // Styles pour le type de livraison
  deliveryTypeContainer: {
    gap: 12,
    marginBottom: 16,
  },
  deliveryTypeCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  deliveryTypeCardActive: {
    borderColor: '#E31837',
    backgroundColor: '#fef2f2',
  },
  deliveryTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deliveryTypeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTypeRadio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryTypeContent: {
    flex: 1,
  },
  deliveryTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  deliveryTypeTitleActive: {
    color: '#E31837',
  },
  deliveryTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  // Styles pour la sélection de date/heure
  dateTimeSection: {
    marginTop: 16,
  },
  dateTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  dateTimeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  dateTimeButtonError: {
    borderColor: '#E31837',
    backgroundColor: '#fef2f2',
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    marginRight: 12,
  },
  dateTimeButtonTextError: {
    color: '#E31837',
  },
  dateTimeErrorText: {
    fontSize: 12,
    color: '#E31837',
    marginTop: 8,
    marginLeft: 4,
  },
}); 