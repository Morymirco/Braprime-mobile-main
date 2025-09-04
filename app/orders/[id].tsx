import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../lib/contexts/AuthContext';
import { orderService, type Order } from '../../lib/services/OrderService';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async (isRefresh = false) => {
    if (!id) {
      setError('ID de commande manquant');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const { order: orderData, error: orderError } = await orderService.getOrder(id);
      
      if (orderError) {
        setError('Erreur lors du chargement de la commande');
        showToast('error', 'Impossible de charger les détails de la commande');
      } else if (orderData) {
        setOrder(orderData);
        setError(null);
      } else {
        setError('Commande introuvable');
        showToast('error', 'La commande que vous recherchez n\'existe pas');
      }
    } catch (err) {
      setError('Erreur lors du chargement');
      showToast('error', 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const onRefresh = () => {
    loadOrder(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'preparing': return '#9C27B0';
      case 'ready': return '#3F51B5';
      case 'out_for_delivery': return '#E91E63';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'out_for_delivery': return 'En cours de livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle';
      case 'preparing': return 'restaurant';
      case 'ready': return 'done';
      case 'out_for_delivery': return 'local-shipping';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  // Helper function to determine if step is completed
  const isStepCompleted = (stepStatus: string) => {
    const statusOrder = [
      'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'
    ];
    
    // Normaliser le statut actuel pour gérer les deux variantes
    let currentStatus = order?.status;
    if (currentStatus === 'out_for_delivery') {
      currentStatus = 'picked_up'; // Traiter out_for_delivery comme picked_up
    }
    
    const currentStatusIndex = statusOrder.indexOf(currentStatus || '');
    const stepStatusIndex = statusOrder.indexOf(stepStatus);
    
    return currentStatusIndex >= stepStatusIndex;
  };
  
  // Helper function to determine if step is current
  const isCurrentStep = (stepStatus: string) => {
    // Normaliser pour gérer les deux variantes du statut de livraison
    if (stepStatus === 'picked_up') {
      return order?.status === 'picked_up' || order?.status === 'out_for_delivery';
    }
    return order?.status === stepStatus;
  };

  // Calculate estimated remaining time
  const calculateRemainingTime = () => {
    if (!order) return "Calcul en cours...";
    
    // Pour les commandes de livraison
    if (order.delivery_method === 'delivery') {
      if (order.estimated_delivery) {
        const estimatedDelivery = new Date(order.estimated_delivery);
        const now = new Date();
        
        if (now > estimatedDelivery) {
          return "Livraison imminente";
        }
        
        const remainingMs = estimatedDelivery.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
        
        return `Environ ${remainingMinutes} minutes`;
      }
      return "30-45 minutes"; // Estimation par défaut
    }
    
    // Pour les commandes à emporter
    if (order.estimated_delivery) {
      const estimatedDelivery = new Date(order.estimated_delivery);
      const now = new Date();
      
      if (now > estimatedDelivery) {
        return "Prête à être récupérée";
      }
      
      const remainingMs = estimatedDelivery.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      
      return `Environ ${remainingMinutes} minutes`;
    }
    
    return "15-20 minutes"; // Estimation par défaut pour les commandes à emporter
  };

  const handleCancelOrder = () => {
    if (order && ['pending', 'confirmed'].includes(order.status)) {
      // TODO: Implémenter l'annulation de commande
      showToast('info', 'Fonctionnalité d\'annulation en cours de développement');
    }
  };

  const handleCallDriver = () => {
    if (order?.driver_phone) {
      Linking.openURL(`tel:${order.driver_phone}`);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Chargement de la commande...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <ToastContainer />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error || 'Commande introuvable'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadOrder()}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ToastContainer />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#E31837" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suivi de commande</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Numéro de commande */}
        <View style={styles.orderNumberCard}>
          <Text style={styles.orderNumberLabel}>Numéro de commande</Text>
          <Text style={styles.orderNumber}>
            #{order.order_number || `CMD-${order.id.slice(0, 8).toUpperCase()}`}
          </Text>
        </View>

        {/* Statut de la commande avec progression */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Statut de la commande</Text>
            <View style={styles.statusBadges}>
              <View style={styles.orderNumberBadge}>
                <Text style={styles.orderNumberBadgeText}>
                  #{order.order_number || order.id.slice(0, 8)}
                </Text>
              </View>
              {(order.status === 'out_for_delivery' || order.status === 'delivered') && order.verification_code && (
                <View style={styles.verificationBadge}>
                  <Text style={styles.verificationBadgeText}>
                    {order.verification_code}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {order.status === 'cancelled' ? (
            <View style={styles.cancelledCard}>
              <Text style={styles.cancelledText}>
                Cette commande a été annulée.
              </Text>
            </View>
          ) : (
            <>
              {/* Progress Steps */}
              <View style={styles.progressContainer}>
                {/* Progress Line */}
                <View style={styles.progressLine} />
                
                {/* Step 1: Confirmed */}
                <View style={styles.stepContainer}>
                  <View style={[
                    styles.stepIcon,
                    isStepCompleted('confirmed') ? styles.stepCompleted : styles.stepPending
                  ]}>
                    <MaterialIcons 
                      name="store" 
                      size={20} 
                      color={isStepCompleted('confirmed') ? '#fff' : '#666'} 
                    />
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>Commande confirmée</Text>
                      {isCurrentStep('confirmed') && (
                        <View style={styles.currentStepBadge}>
                          <Text style={styles.currentStepBadgeText}>En cours</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepDescription}>
                      Le restaurant a confirmé votre commande
                    </Text>
                  </View>
                </View>
                
                {/* Step 2: Preparing */}
                <View style={styles.stepContainer}>
                  <View style={[
                    styles.stepIcon,
                    isStepCompleted('preparing') ? styles.stepCompleted : styles.stepPending
                  ]}>
                    <MaterialIcons 
                      name="restaurant" 
                      size={20} 
                      color={isStepCompleted('preparing') ? '#fff' : '#666'} 
                    />
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>Préparation</Text>
                      {isCurrentStep('preparing') && (
                        <View style={styles.currentStepBadge}>
                          <Text style={styles.currentStepBadgeText}>En cours</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepDescription}>
                      Votre commande est en cours de préparation
                    </Text>
                  </View>
                </View>
                
                {/* Step 3: Ready */}
                <View style={styles.stepContainer}>
                  <View style={[
                    styles.stepIcon,
                    isStepCompleted('ready') ? styles.stepCompleted : styles.stepPending
                  ]}>
                    <MaterialIcons 
                      name="done" 
                      size={20} 
                      color={isStepCompleted('ready') ? '#fff' : '#666'} 
                    />
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>Commande prête</Text>
                      {isCurrentStep('ready') && (
                        <View style={styles.currentStepBadge}>
                          <Text style={styles.currentStepBadgeText}>En cours</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepDescription}>
                      {order.delivery_method === 'delivery' 
                        ? 'Votre commande est prête pour la livraison'
                        : 'Votre commande est prête à être récupérée'}
                    </Text>
                  </View>
                </View>
                
                {/* Step 4: On the way - Only for delivery */}
                {order.delivery_method === 'delivery' && (
                  <View style={styles.stepContainer}>
                    <View style={[
                      styles.stepIcon,
                      isStepCompleted('out_for_delivery') ? styles.stepCompleted : styles.stepPending
                    ]}>
                      <MaterialIcons 
                        name="local-shipping" 
                        size={20} 
                        color={isStepCompleted('out_for_delivery') ? '#fff' : '#666'} 
                      />
                    </View>
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Text style={styles.stepTitle}>En route</Text>
                        {isCurrentStep('out_for_delivery') && (
                          <View style={styles.currentStepBadge}>
                            <Text style={styles.currentStepBadgeText}>En cours</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.stepDescription}>
                        Le livreur est en route vers votre adresse
                      </Text>
                      
                      {/* Informations du livreur */}
                      {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
                        <View style={styles.driverInfo}>
                          {order.driver_name ? (
                            <>
                              <Text style={styles.driverName}>Livreur: {order.driver_name}</Text>
                              {order.driver_phone && (
                                <TouchableOpacity 
                                  style={styles.callDriverButton}
                                  onPress={handleCallDriver}
                                >
                                  <MaterialIcons name="phone" size={16} color="#E31837" />
                                  <Text style={styles.callDriverText}>Appeler le livreur</Text>
                                </TouchableOpacity>
                              )}
                            </>
                          ) : (
                            <Text style={styles.driverName}>Un livreur a été assigné à votre commande</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                )}
                
                {/* Step 5: Delivered */}
                <View style={styles.stepContainer}>
                  <View style={[
                    styles.stepIcon,
                    isStepCompleted('delivered') ? styles.stepCompleted : styles.stepPending
                  ]}>
                    <MaterialIcons 
                      name="check-circle" 
                      size={20} 
                      color={isStepCompleted('delivered') ? '#fff' : '#666'} 
                    />
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>
                        {order.delivery_method === 'delivery' ? 'Livrée' : 'Récupérée'}
                      </Text>
                      {isCurrentStep('delivered') && (
                        <View style={styles.currentStepBadge}>
                          <Text style={styles.currentStepBadgeText}>Terminée</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepDescription}>
                      {order.delivery_method === 'delivery'
                        ? 'Votre commande a été livrée avec succès'
                        : 'Vous avez récupéré votre commande'}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Order Actions */}
              <View style={styles.orderActions}>
                <View style={styles.timeInfo}>
                  <MaterialIcons name="schedule" size={16} color="#666" />
                  <Text style={styles.timeText}>
                    {order.status === 'delivered' ? 
                      (order.delivery_method === 'delivery' ? 'Livrée le' : 'Récupérée le') : 
                      (order.delivery_method === 'delivery' ? 'Livraison estimée' : 'Prête à')}
                    : {order.status === 'delivered' && order.actual_delivery ? 
                      formatDate(order.actual_delivery) + ' à ' + formatTime(order.actual_delivery) : 
                      calculateRemainingTime()}
                  </Text>
                </View>
                
                {['pending', 'confirmed'].includes(order.status) && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelOrder}
                  >
                    <Text style={styles.cancelButtonText}>Annuler la commande</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* Détails de la commande */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Détails de la commande</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.businessInfo}>
              <MaterialIcons name="store" size={16} color="#10b981" />
              <Text style={styles.businessName}>{order.business_name}</Text>
            </View>
            
            <View style={styles.itemsSection}>
              <Text style={styles.itemsSectionTitle}>Articles</Text>
              {order.items?.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      <Text style={styles.itemQuantity}>{item.quantity}x</Text> {item.name}
                    </Text>
                    {item.special_instructions && !item.special_instructions.includes('package_order_id') && (
                      <Text style={styles.itemNote}>
                        Note: {item.special_instructions}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString()} GNF
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.divider} />
            
            {/* Résumé du paiement */}
            <View style={styles.pricingSection}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Sous-total</Text>
                <Text style={styles.pricingValue}>{(order.total || 0).toLocaleString()} GNF</Text>
              </View>
              
              {(order.delivery_fee || 0) > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Frais de livraison</Text>
                  <Text style={styles.pricingValue}>{(order.delivery_fee || 0).toLocaleString()} GNF</Text>
                </View>
              )}
              
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Frais de service (2%)</Text>
                <Text style={styles.pricingValue}>{(order.tax || 0).toLocaleString()} GNF</Text>
              </View>
              
              <View style={[styles.pricingRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{(order.grand_total || 0).toLocaleString()} GNF</Text>
              </View>
              
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Statut du paiement</Text>
                <View style={[
                  styles.paymentStatusBadge,
                  order.payment_status === 'paid' ? styles.paymentStatusPaid :
                  order.payment_status === 'failed' ? styles.paymentStatusFailed :
                  styles.paymentStatusPending
                ]}>
                  <Text style={[
                    styles.paymentStatusText,
                    order.payment_status === 'paid' ? styles.paymentStatusTextPaid :
                    order.payment_status === 'failed' ? styles.paymentStatusTextFailed :
                    styles.paymentStatusTextPending
                  ]}>
                    {order.payment_status === 'paid' ? 'Payé' :
                     order.payment_status === 'failed' ? 'Échoué' :
                     order.payment_status === 'refunded' ? 'Remboursé' : 'En attente'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Informations de livraison */}
            <View style={styles.deliverySection}>
              <Text style={styles.deliverySectionTitle}>
                {order.delivery_method === 'delivery' ? 'Informations de livraison' : 'Informations de retrait'}
              </Text>
              
              <View style={styles.deliveryInfo}>
                <MaterialIcons name="location-on" size={16} color="#E31837" />
                <View style={styles.deliveryInfoContent}>
                  {order.delivery_method === 'delivery' ? (
                    <>
                      <Text style={styles.deliveryInfoTitle}>Adresse de livraison</Text>
                      <Text style={styles.deliveryInfoText}>{order.delivery_address}</Text>
                      {order.landmark && (
                        <Text style={styles.landmarkText}>Point de repère: {order.landmark}</Text>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.deliveryInfoTitle}>Adresse de retrait</Text>
                      <Text style={styles.deliveryInfoText}>{order.business_name}</Text>
                      <Text style={styles.pickupNote}>
                        Veuillez présenter l'identifiant de votre commande lors du retrait
                      </Text>
                    </>
                  )}
                </View>
              </View>
              
              {order.delivery_instructions && (
                <View style={styles.deliveryInfo}>
                  <MaterialIcons name="schedule" size={16} color="#E31837" />
                  <View style={styles.deliveryInfoContent}>
                    <Text style={styles.deliveryInfoTitle}>Instructions de livraison</Text>
                    <Text style={styles.deliveryInfoText}>{order.delivery_instructions}</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.deliveryInfo}>
                <MaterialIcons name="schedule" size={16} color="#E31837" />
                <View style={styles.deliveryInfoContent}>
                  <Text style={styles.deliveryInfoTitle}>Commande passée le</Text>
                  <Text style={styles.deliveryInfoText}>
                    {formatDate(order.created_at)} à {formatTime(order.created_at)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Résumé de la commande */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé</Text>
          
          <View style={styles.summaryItems}>
            <View style={styles.summaryItem}>
              <MaterialIcons name="receipt" size={20} color="#E31837" />
              <View style={styles.summaryItemContent}>
                <Text style={styles.summaryItemTitle}>Total de la commande</Text>
                <Text style={styles.summaryItemValue}>{(order.grand_total || 0).toLocaleString()} GNF</Text>
              </View>
            </View>
            
            <View style={styles.summaryItem}>
              <MaterialIcons 
                name={order.delivery_method === 'delivery' ? 'local-shipping' : 'store'} 
                size={20} 
                color="#E31837" 
              />
              <View style={styles.summaryItemContent}>
                <Text style={styles.summaryItemTitle}>Mode de livraison</Text>
                <Text style={styles.summaryItemSubtitle}>
                  {order.delivery_method === 'delivery' ? 'Livraison à domicile' : 'À emporter'}
                </Text>
              </View>
            </View>
            
            <View style={styles.summaryItem}>
              <MaterialIcons name="list" size={20} color="#E31837" />
              <View style={styles.summaryItemContent}>
                <Text style={styles.summaryItemTitle}>Articles</Text>
                <Text style={styles.summaryItemSubtitle}>{order.items?.length || 0} article(s)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Code de vérification */}
        {(order.status === 'out_for_delivery' || order.status === 'delivered') && order.verification_code && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Code de vérification</Text>
            <View style={styles.verificationContainer}>
              <Text style={styles.verificationCode}>{order.verification_code}</Text>
              <Text style={styles.verificationText}>
                Montrez ce code au livreur pour confirmer la réception
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/orders')}
          >
            <MaterialIcons name="list" size={20} color="#E31837" />
            <Text style={styles.actionButtonText}>Mes commandes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/')}
          >
            <MaterialIcons name="home" size={20} color="#fff" />
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Accueil</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
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
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  orderNumberCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderNumberLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E31837',
  },
  statusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  orderNumberBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderNumberBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  verificationBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verificationBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    fontFamily: 'monospace',
  },
  cancelledCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
  },
  cancelledText: {
    color: '#dc2626',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressContainer: {
    position: 'relative',
    paddingLeft: 20,
  },
  progressLine: {
    position: 'absolute',
    left: 19,
    top: 20,
    width: 2,
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    position: 'relative',
    zIndex: 10,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepCompleted: {
    backgroundColor: '#10b981',
  },
  stepPending: {
    backgroundColor: '#e5e7eb',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  currentStepBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  currentStepBadgeText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  driverInfo: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  callDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E31837',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  callDriverText: {
    fontSize: 14,
    color: '#E31837',
    fontWeight: '500',
    marginLeft: 4,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    color: '#E31837',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#E31837',
    fontWeight: 'bold',
  },
  verificationContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  verificationCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E31837',
    letterSpacing: 4,
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E31837',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#E31837',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E31837',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#fff',
  },
});
