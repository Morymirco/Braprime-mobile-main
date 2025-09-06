import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddressAutocomplete from '../components/AddressAutocomplete';
import CommuneQuartierSelector from '../components/CommuneQuartierSelector';
import PaymentWebView from '../components/PaymentWebView';
import ToastContainer from '../components/ToastContainer';
import { useCart } from '../hooks/use-cart';
import { useAuth } from '../lib/contexts/AuthContext';
import { useToast } from '../lib/contexts/ToastContext';
import { orderService } from '../lib/services/OrderService';
import { PaymentRequest, PaymentService } from '../lib/services/PaymentService';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, loadingStates, clearCart } = useCart();
  const { showToast } = useToast();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryTimeMode, setDeliveryTimeMode] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    landmark: '', // Point de repère (ajouté)
    commune: '', // Commune (ajouté)
    quartier: '', // Quartier (ajouté)
    notes: ''
  });

  // États pour la sélection de commune et quartier
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [selectedQuartier, setSelectedQuartier] = useState<string>('');
  
  // États pour le paiement
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'orange_money' | 'mtn_money'>('orange_money');

  const paymentMethod = 'card' as const; // Paiement en ligne obligatoire
  
  // Fonction pour mapper les méthodes de paiement UI vers API
  const getPaymentMethodCode = (uiMethod: string): string => {
    switch (uiMethod) {
      case 'orange_money':
        return 'lp-om-gn'; // Code API pour Orange Money Guinea
      case 'mtn_money':
        return 'lp-mtn-gn'; // Code API pour MTN Money Guinea
      default:
        return 'mobile_money'; // Fallback
    }
  };

  // Pré-remplir les informations personnelles depuis le profil utilisateur
  useEffect(() => {
    if (user && !formData.firstName) {
      // Extraire prénom et nom depuis le nom complet
      const fullName = user.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone_number || ''
      }));
    }
  }, [user, formData.firstName]);

  // Plus besoin de vérification périodique - on utilise la même logique que le client web
  // La WebView détecte la redirection vers order-confirmation et on vérifie en base

  // Calculer les totaux
  const cartTotal = cart?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  const baseDeliveryFee = deliveryMethod === 'delivery' ? 15000 : 0;
  const deliveryFee = cart?.is_multi_service ? Math.round(baseDeliveryFee * 1.5) : baseDeliveryFee;
  const planningFee = deliveryMethod === 'delivery' && deliveryTimeMode === 'scheduled' ? 2000 : 0; // Frais de planification
  const serviceFee = Math.round(cartTotal * 0.02); // 2% frais de service
  const grandTotal = cartTotal + deliveryFee + planningFee + serviceFee;

  // Gestion des changements de commune et quartier
  const handleCommuneChange = (communeId: string) => {
    setSelectedCommune(communeId);
    setSelectedQuartier(''); // Réinitialiser le quartier
    setFormData(prev => ({ ...prev, commune: communeId, quartier: '' }));
  };

  const handleQuartierChange = (quartierId: string) => {
    setSelectedQuartier(quartierId);
    setFormData(prev => ({ ...prev, quartier: quartierId }));
  };

  // Validation du formulaire
  const isFormValid = () => {
    if (!cart || cart.items.length === 0) return false;
    
    const requiredFields = [formData.firstName, formData.lastName, formData.phone];
    
    if (deliveryMethod === 'delivery') {
      // Validation de l'adresse
      if (!formData.address.trim()) {
        return false;
      }
      
      // Validation que l'adresse contient une virgule (adresse complète sélectionnée)
      if (!formData.address.includes(',')) {
        return false;
      }
    }
    
    // Validation commune et quartier pour la livraison
    if (deliveryMethod === 'delivery' && (!selectedCommune || !selectedQuartier)) {
      return false;
    }
    
    // Validation pour la livraison programmée
    if (deliveryMethod === 'delivery' && deliveryTimeMode === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        return false;
      }
      
      // Vérifier que la date est dans le futur
      const scheduledDateTime = new Date(`${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}:00`);
      if (scheduledDateTime <= new Date()) {
        return false;
      }
    }
    
    return requiredFields.every(field => field.trim() !== '');
  };

  // Gérer la soumission de la commande
  const handleSubmitOrder = async () => {
    if (!isFormValid()) {
      showToast('error', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!user?.id) {
      showToast('error', 'Vous devez être connecté pour passer une commande.');
      return;
    }

    try {
      // Préparer les données de commande complètes (adapté au schéma mobile)
      const orderData = {
        user_id: user.id,
        business_id: cart?.is_multi_service ? undefined : cart?.business_id,
        // items n'existe pas dans le schéma mobile (table séparée order_items)
        status: 'pending' as const,
        total: cartTotal,
        delivery_fee: deliveryFee,
        service_fee: serviceFee, // Renommé de 'tax' vers 'service_fee'
        grand_total: grandTotal,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'delivery' ? formData.address : undefined,
        delivery_instructions: formData.notes || undefined,
        payment_method: paymentMethod,
        payment_status: 'pending' as const,
        
        // Coordonnées GPS
        delivery_latitude: deliveryMethod === 'delivery' && formData.address ? 9.5370 : undefined,
        delivery_longitude: deliveryMethod === 'delivery' && formData.address ? -13.6785 : undefined,
        delivery_formatted_address: deliveryMethod === 'delivery' ? formData.address : undefined,
        pickup_latitude: undefined,
        pickup_longitude: undefined,
        pickup_formatted_address: undefined,
        
        // Coordonnées JSONB
        delivery_coordinates: deliveryMethod === 'delivery' && formData.address ? {
          latitude: 9.5370,
          longitude: -13.6785
        } : undefined,
        
        // Zone géographique
        zone: deliveryMethod === 'delivery' ? 'Conakry' : undefined,
        commune: deliveryMethod === 'delivery' ? formData.commune || 'Conakry' : undefined,
        quartier: deliveryMethod === 'delivery' ? formData.quartier || 'Centre-ville' : undefined,
        
        // Type de livraison
        delivery_type: deliveryTimeMode,
        scheduled_delivery_window_start: deliveryTimeMode === 'scheduled' && scheduledDate && scheduledTime ? 
          new Date(`${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}:00`).toISOString() : undefined,
        scheduled_delivery_window_end: deliveryTimeMode === 'scheduled' && scheduledDate && scheduledTime ? 
          new Date(`${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}:00`).toISOString() : undefined,
        preferred_delivery_time: deliveryTimeMode === 'scheduled' && scheduledDate && scheduledTime ? 
          new Date(`${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}:00`).toISOString() : undefined,
        
        // Informations de livraison
        estimated_delivery: deliveryMethod === 'delivery' ? 
          new Date(Date.now() + (30 + Math.random() * 15) * 60000).toISOString() : undefined,
        
        // Point de repère
        landmark: formData.landmark || undefined,
        
        // Champs qui n'existent pas dans le schéma mobile (supprimés)
        // customer_rating, customer_review
      };

      console.log('🔍 DEBUG - Données de commande préparées:', orderData);

      // Créer la commande
      const { success, orderId, error: orderError } = await createOrderWithoutClearingCart(orderData, cart || undefined);
      
      if (success && orderId) {
        console.log('✅ Commande créée avec succès:', orderId);
        setCurrentOrderId(orderId);
        
        // Créer le paiement via Lengo Pay (le panier sera vidé après l'ouverture de la WebView)
        await handleCreatePayment(orderId);
      } else {
        showToast('error', orderError || 'Impossible de créer la commande. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      showToast('error', 'Une erreur est survenue lors de la création de la commande.');
    }
  };

  // Créer le paiement via Lengo Pay
  const handleCreatePayment = async (orderId: string) => {
    try {
      if (!user?.id || !cart) {
        showToast('error', 'Données utilisateur ou panier manquantes');
        return;
      }

      // Validation supplémentaire des paramètres de paiement
      if (!formData.phone || formData.phone.trim() === '') {
        showToast('error', 'Le numéro de téléphone est requis pour le paiement');
        return;
      }

      // Préparer les données de paiement
      const paymentData: PaymentRequest = {
        order_id: orderId,
        user_id: user.id,
        amount: grandTotal,
        currency: 'GNF',
        payment_method: getPaymentMethodCode(selectedPaymentMethod), // Utiliser le code API correct
        phone_number: formData.phone.trim(),
        order_number: orderId, // Utiliser l'ID de commande comme numéro
        business_name: cart.is_multi_service ? 'Multi-services' : (cart.business_name || 'BraPrime'),
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_email: formData.email || user.email || '',
      };

      console.log('🔍 DEBUG - Création du paiement avec les données:', paymentData);

      // Validation finale des paramètres requis
      const requiredParams = ['order_id', 'user_id', 'amount', 'payment_method', 'phone_number', 'order_number', 'business_name', 'customer_name', 'customer_email'];
      const missingParams = requiredParams.filter(param => !paymentData[param as keyof PaymentRequest]);
      
      if (missingParams.length > 0) {
        console.error('❌ Paramètres manquants:', missingParams);
        showToast('error', `Paramètres manquants: ${missingParams.join(', ')}`);
        return;
      }

      const paymentResponse = await PaymentService.createPayment(paymentData);
      
      console.log('🔍 DEBUG - Réponse du paiement:', paymentResponse);
      
      if (paymentResponse.success && paymentResponse.payment_url) {
        setPaymentUrl(paymentResponse.payment_url);
        setShowPaymentWebView(true);
        showToast('success', 'Redirection vers le paiement...');
        
        // Vider le panier après l'ouverture de la WebView
        setTimeout(async () => {
          try {
            await clearCart();
            console.log('🛒 Panier vidé après ouverture de la WebView de paiement');
          } catch (error) {
            console.error('❌ Erreur lors du vidage du panier:', error);
          }
        }, 1000); // Attendre 1 seconde pour que la WebView s'ouvre
      } else {
        throw new Error(paymentResponse.error || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du paiement:', error);
      showToast('error', error instanceof Error ? error.message : 'Erreur lors de la création du paiement');
    }
  };


  // Gérer le succès du paiement (appelé par la WebView)
  const handlePaymentSuccess = async (payId: string) => {
    console.log('✅ Paiement réussi avec pay_id:', payId);
    
    // Fermer la WebView immédiatement
    setShowPaymentWebView(false);
    
    // Rediriger vers la page de confirmation avec l'ID de la commande
    // La page de confirmation se chargera de vérifier le statut en base de données
    if (currentOrderId) {
      console.log('🔄 Redirection vers la page de confirmation avec order_id:', currentOrderId);
      router.replace(`/payment-confirmation?order_id=${currentOrderId}&pay_id=${payId}` as any);
    } else {
      console.error('❌ ID de commande manquant pour la redirection');
      showToast('error', 'Erreur: ID de commande manquant');
    }
  };

  // Gérer l'erreur du paiement (appelé par la WebView)
  const handlePaymentError = (error: string) => {
    console.log('❌ Erreur de paiement:', error);
    setShowPaymentWebView(false);
    showToast('error', error);
    
    // Rediriger vers la page de confirmation avec le statut d'erreur
    if (currentOrderId) {
      router.replace(`/payment-confirmation?order_id=${currentOrderId}&status=failed` as any);
    }
  };

  // Fermer la WebView de paiement
  const handleClosePaymentWebView = () => {
    setShowPaymentWebView(false);
    showToast('info', 'Paiement annulé');
  };

  // Créer une commande sans vider le panier
  const createOrderWithoutClearingCart = async (orderData: any, cartData: any) => {
    try {
      console.log('🛒 Création de commande sans vider le panier:', orderData);
      
      // Utiliser directement le service de commandes sans passer par convertToOrder
      const { orderId, error: orderError } = await orderService.createOrder(orderData, cartData);
      
      if (orderId) {
        console.log('✅ Commande créée sans vider le panier:', orderId);
        return { success: true, orderId };
      } else {
        console.error('❌ Erreur lors de la création de la commande:', orderError);
        return { success: false, error: orderError || 'Erreur lors de la création de la commande' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la commande';
      console.error('❌ Erreur dans createOrderWithoutClearingCart:', err);
      return { success: false, error: errorMessage };
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  // Rediriger vers le panier si pas d'articles (sauf si WebView de paiement ouverte)
  if (!loading && (!cart || cart.items.length === 0) && !showPaymentWebView) {
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
        {/* Articles commandés */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="shopping-cart" size={20} color="#E31837" />
            <Text style={styles.sectionTitle}>Articles commandés</Text>
          </View>
          <View style={styles.sectionContent}>
            {cart?.items && cart.items.length > 0 ? (
              <View style={styles.itemsContainer}>
                {cart.is_multi_service && cart.businesses && cart.businesses.length > 0 ? (
                  // Affichage multi-services
                  cart.businesses
                    .map((business) => {
                      // Filtrer les articles qui appartiennent à ce business
                      const businessItems = cart.items?.filter(item => 
                        item.business_id === business.id
                      ) || [];
                      
                      // Ne pas afficher la section si aucun article pour ce business
                      if (businessItems.length === 0) return null;
                      
                      return (
                        <View key={business.id} style={styles.businessSection}>
                          <View style={styles.businessHeader}>
                            <MaterialIcons name="store" size={16} color="#4CAF50" />
                            <Text style={styles.businessTitle}>{business.name}</Text>
                            <Text style={styles.businessTotal}>
                              {businessItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0).toLocaleString()} GNF
                            </Text>
                          </View>
                          {businessItems.map((item, index) => (
                            <View key={`${business.id}-${item.id || index}`} style={styles.cartItem}>
                              <View style={styles.itemImageContainer}>
                                {item.image ? (
                                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                                ) : (
                                  <View style={styles.itemImagePlaceholder}>
                                    <MaterialIcons name="restaurant" size={20} color="#ccc" />
                                  </View>
                                )}
                            </View>
                            <View style={styles.itemDetails}>
                              <Text style={styles.itemName}>{item.name}</Text>
                              <View style={styles.itemMeta}>
                                <Text style={styles.itemQuantity}>Qté: {item.quantity}</Text>
                                <Text style={styles.itemPrice}>{((item.price || 0) * (item.quantity || 0)).toLocaleString()} GNF</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  })
                    .filter(Boolean) // Supprimer les sections vides (null)
                ) : (
                  // Affichage simple pour un seul service
                  cart.items && cart.items.length > 0 && cart.items.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                      <View style={styles.itemImageContainer}>
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={styles.itemImage} />
                        ) : (
                          <View style={styles.itemImagePlaceholder}>
                            <MaterialIcons name="restaurant" size={20} color="#ccc" />
                          </View>
                        )}
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemQuantity}>Qté: {item.quantity}</Text>
                          <Text style={styles.itemPrice}>{((item.price || 0) * (item.quantity || 0)).toLocaleString()} GNF</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.emptyItemsContainer}>
                <MaterialIcons name="shopping-cart" size={48} color="#ccc" />
                <Text style={styles.emptyItemsText}>Aucun article dans le panier</Text>
              </View>
            )}
          </View>
        </View>

                 {/* Mode de livraison */}
         <View style={styles.section}>
           <View style={styles.sectionHeader}>
             <MaterialIcons name="local-shipping" size={20} color="#E31837" />
             <Text style={styles.sectionTitle}>Mode de livraison</Text>
           </View>
           <View style={styles.sectionContent}>
             <TouchableOpacity
               style={[
                 styles.deliveryOptionCard,
                 deliveryMethod === 'delivery' && styles.deliveryOptionCardActive
               ]}
               onPress={() => setDeliveryMethod('delivery')}
             >
               <Text style={styles.deliveryOptionTitle}>Livraison à domicile</Text>
               <Text style={styles.deliveryOptionPrice}>{(deliveryFee || 0).toLocaleString()} GNF</Text>
             </TouchableOpacity>

             <TouchableOpacity
               style={[
                 styles.deliveryOptionCard,
                 deliveryMethod === 'pickup' && styles.deliveryOptionCardActive
               ]}
               onPress={() => setDeliveryMethod('pickup')}
             >
               <Text style={styles.deliveryOptionTitle}>À emporter</Text>
               <Text style={styles.deliveryOptionPrice}>Aucun frais</Text>
             </TouchableOpacity>
           </View>
         </View>

         {/* Type de livraison (ASAP ou programmée) */}
         {deliveryMethod === 'delivery' && (
           <View style={styles.section}>
             <View style={styles.sectionHeader}>
               <MaterialIcons name="schedule" size={20} color="#E31837" />
               <Text style={styles.sectionTitle}>Horaires de livraison</Text>
             </View>
             <View style={styles.sectionContent}>
               <View style={styles.deliveryTimeContainer}>
                 <TouchableOpacity
                   style={[
                     styles.deliveryTimeOption,
                     deliveryTimeMode === 'asap' && styles.deliveryTimeOptionActive
                   ]}
                   onPress={() => setDeliveryTimeMode('asap')}
                 >
                   <MaterialIcons name="local-shipping" size={16} color={deliveryTimeMode === 'asap' ? '#E31837' : '#666'} />
                   <Text style={[styles.deliveryTimeTitle, deliveryTimeMode === 'asap' && styles.deliveryTimeTitleActive]}>
                     Livraison rapide
                   </Text>
                   <Text style={styles.deliveryTimeSubtitle}>30-45 min</Text>
                 </TouchableOpacity>

                 <TouchableOpacity
                   style={[
                     styles.deliveryTimeOption,
                     deliveryTimeMode === 'scheduled' && styles.deliveryTimeOptionActive
                   ]}
                   onPress={() => setDeliveryTimeMode('scheduled')}
                 >
                   <MaterialIcons name="schedule" size={16} color={deliveryTimeMode === 'scheduled' ? '#E31837' : '#666'} />
                   <Text style={[styles.deliveryTimeTitle, deliveryTimeMode === 'scheduled' && styles.deliveryTimeTitleActive]}>
                     Livraison programmée
                   </Text>
                   <Text style={styles.deliveryTimeSubtitle}>+2000 GNF</Text>
                 </TouchableOpacity>
               </View>

               {/* Sélecteurs de date et heure pour la livraison programmée */}
               {deliveryTimeMode === 'scheduled' && (
                 <View style={styles.scheduledDeliveryContainer}>
                   <View style={styles.inputRow}>
                     <View style={styles.inputContainer}>
                       <Text style={styles.inputLabel}>Date de livraison *</Text>
                       <TextInput
                         style={styles.input}
                         value={scheduledDate ? scheduledDate.toISOString().split('T')[0] : ''}
                         onChangeText={(text) => {
                           if (text) {
                             const date = new Date(text);
                             if (!isNaN(date.getTime())) {
                               setScheduledDate(date);
                             }
                           }
                         }}
                         placeholder="YYYY-MM-DD"
                         placeholderTextColor="#999"
                       />
                     </View>
                     
                     <View style={styles.inputContainer}>
                       <Text style={styles.inputLabel}>Heure de livraison *</Text>
                       <TextInput
                         style={styles.input}
                         value={scheduledTime}
                         onChangeText={setScheduledTime}
                         placeholder="HH:MM"
                         placeholderTextColor="#999"
                       />
                     </View>
                   </View>
                   
                   {scheduledDate && scheduledTime && (
                     <View style={styles.scheduledInfoContainer}>
                       <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                       <Text style={styles.scheduledInfoText}>
                         Livraison programmée le {scheduledDate.toLocaleDateString('fr-FR')} à {scheduledTime}
                       </Text>
                     </View>
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
                <Text style={styles.inputLabel}>Prénom *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  placeholder="Votre prénom"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom de famille *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Votre nom de famille"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="votre.email@exemple.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="+224 XXX XX XX XX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Adresse de livraison */}
        {deliveryMethod === 'delivery' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={20} color="#E31837" />
              <Text style={styles.sectionTitle}>Adresse de livraison</Text>
            </View>
            <View style={styles.sectionContent}>
              {/* Message informatif pour les frais estimés */}
              {!formData.address && (
                <View style={styles.infoContainer}>
                  <View style={styles.infoHeader}>
                    <MaterialIcons name="info" size={16} color="#FF9800" />
                    <Text style={styles.infoTitle}>💡 Frais de livraison estimés</Text>
                  </View>
                  <Text style={styles.infoText}>
                    Saisissez votre adresse pour obtenir un calcul précis des frais de livraison basé sur la distance réelle.
                  </Text>
                </View>
              )}

              {/* Autocomplétion d'adresse avec carte */}
              <AddressAutocomplete
                value={formData.address}
                onChange={(address) => setFormData(prev => ({ ...prev, address }))}
                onPlaceSelect={(place) => {
                  if (place && place.formatted_address) {
                    setFormData(prev => ({ ...prev, address: place.formatted_address }));
                  }
                }}
                placeholder="Rechercher et sélectionner une adresse valide..."
                label="Adresse complète"
                required={true}
                showMap={true}
              />
              
              <Text style={styles.addressHint}>
                ⚠️ Veuillez sélectionner une adresse depuis la liste pour garantir la validité
              </Text>

              {/* Sélection commune et quartier */}
              <View style={styles.locationSelectorContainer}>
                <Text style={styles.locationSelectorTitle}>📍 Sélection de votre localisation</Text>
                <CommuneQuartierSelector
                  selectedCommune={selectedCommune}
                  selectedQuartier={selectedQuartier}
                  onCommuneChange={handleCommuneChange}
                  onQuartierChange={handleQuartierChange}
                  required={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Point de repère</Text>
                <TextInput
                  style={styles.input}
                  value={formData.landmark}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, landmark: text }))}
                  placeholder="Ex: près de la pharmacie, école..."
                  placeholderTextColor="#999"
                />
              </View>

               <View style={styles.inputContainer}>
                 <Text style={styles.inputLabel}>Instructions de livraison</Text>
                 <TextInput
                   style={[styles.input, styles.textArea]}
                   value={formData.notes}
                   onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                   placeholder="Instructions spéciales pour le livreur"
                   placeholderTextColor="#999"
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
            <Text style={styles.paymentSubtitle}>Choisissez votre méthode de paiement :</Text>
            
            {/* Orange Money */}
            <TouchableOpacity 
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'orange_money' && styles.paymentMethodCardSelected
              ]}
              onPress={() => setSelectedPaymentMethod('orange_money')}
            >
              <Text style={styles.paymentEmoji}>🧡</Text>
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>Orange Money</Text>
                <Text style={styles.paymentMethodDescription}>
                  Paiement via votre compte Orange Money
                </Text>
              </View>
              {selectedPaymentMethod === 'orange_money' && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>

            {/* MTN Money */}
            <TouchableOpacity 
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'mtn_money' && styles.paymentMethodCardSelected
              ]}
              onPress={() => setSelectedPaymentMethod('mtn_money')}
            >
              <Text style={styles.paymentEmoji}>📱</Text>
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>MTN Money</Text>
                <Text style={styles.paymentMethodDescription}>
                  Paiement via votre compte MTN Money
                </Text>
              </View>
              {selectedPaymentMethod === 'mtn_money' && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Résumé de commande fixe en bas */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {cart?.items?.length || 0} article{(cart?.items?.length || 0) > 1 ? 's' : ''}
            </Text>
            <Text style={styles.summaryValue}>{(cartTotal || 0).toLocaleString()} GNF</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de service (2%)</Text>
            <Text style={styles.summaryValue}>{(serviceFee || 0).toLocaleString()} GNF</Text>
          </View>
          
                     <View style={styles.summaryRow}>
             <Text style={styles.summaryLabel}>
               {deliveryMethod === 'delivery' ? 'Livraison' : 'Préparation'}
             </Text>
             <Text style={styles.summaryValue}>{(deliveryFee || 0).toLocaleString()} GNF</Text>
           </View>
           
           {/* Frais de planification pour la livraison programmée */}
           {deliveryMethod === 'delivery' && deliveryTimeMode === 'scheduled' && (
             <View style={styles.summaryRow}>
               <Text style={styles.summaryLabel}>Frais de planification</Text>
               <Text style={styles.summaryValue}>{(planningFee || 0).toLocaleString()} GNF</Text>
             </View>
           )}
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{(grandTotal || 0).toLocaleString()} GNF</Text>
          </View>
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
              {loadingStates.convertToOrder ? 'Traitement...' : 'Passer la commande et payer'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modifyCartButton} onPress={() => router.push('/cart')}>
            <Text style={styles.modifyCartButtonText}>Modifier le panier</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal WebView pour le paiement */}
      <Modal
        visible={showPaymentWebView}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClosePaymentWebView}
        statusBarTranslucent={false}
      >
        <PaymentWebView
          paymentUrl={paymentUrl}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onClose={handleClosePaymentWebView}
        />
      </Modal>
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
  summaryText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  deliveryOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  deliveryOptionPrice: {
    fontSize: 14,
    color: '#666',
  },
  paymentSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  paymentEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
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
    maxHeight: '60%',
    minHeight: 300,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  summaryContent: {
    marginBottom: 16,
    maxHeight: 200,
    overflow: 'hidden',
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
  // Styles pour l'affichage des articles
  itemsContainer: {
    gap: 16,
  },
  businessSection: {
    marginBottom: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  businessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    flex: 1,
    marginLeft: 8,
  },
  businessTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  emptyItemsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  // Styles pour la livraison programmée
  deliveryTimeContainer: {
    gap: 12,
  },
  deliveryTimeOption: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryTimeOptionActive: {
    borderColor: '#E31837',
    backgroundColor: '#fef2f2',
  },
  deliveryTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  deliveryTimeTitleActive: {
    color: '#E31837',
  },
  deliveryTimeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scheduledDeliveryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  scheduledInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  scheduledInfoText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Styles pour le sélecteur de localisation
  locationSelectorContainer: {
    marginVertical: 16,
  },
  locationSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  // Styles pour les messages informatifs
  infoContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#F57C00',
    lineHeight: 16,
  },
  addressHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
}); 