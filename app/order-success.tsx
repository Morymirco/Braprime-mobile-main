import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../lib/contexts/AuthContext';
import { orderService, type Order } from '../lib/services/OrderService';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('ID de commande manquant');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { order: orderData, error: orderError } = await orderService.getOrder(orderId);
        if (orderError) {
          setError('Erreur lors du chargement de la commande');
          showToast('error', 'Impossible de charger les détails de la commande');
        } else if (orderData) {
          setOrder(orderData);
        } else {
          setError('Commande introuvable');
          showToast('error', 'La commande que vous recherchez n\'existe pas');
        }
      } catch (err) {
        setError('Erreur lors du chargement');
        showToast('error', 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId, showToast]);

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
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'delivering': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'preparing': return '#2196F3';
      case 'delivering': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };
  const handleTrackOrder = () => {
    if (order?.id) {
      router.push(`/orders/${order.id}`);
    }
  };
  const handleViewOrders = () => {
    router.push('/orders');
  };
  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Chargement de votre commande...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorMessage}>
            {error || 'Impossible de charger les détails de la commande'}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <Text style={styles.primaryButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ToastContainer />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Titre principal */}
        <Text style={styles.title}>Commande confirmée !</Text>
        {/* Numéro de commande */}
        <View style={styles.orderNumberCard}>
          <Text style={styles.orderNumberLabel}>Numéro de commande</Text>
          <Text style={styles.orderNumber}>#{order.order_number || `CMD-${order.id.slice(0, 8).toUpperCase()}`}</Text>
        </View>
        {/* Détails de la commande */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Détails de la commande</Text>
          <View style={styles.section}>
            {/* Statut de la commande */}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Statut</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}> 
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{getStatusText(order.status)}</Text>
              </View>
            </View>
            <Text style={styles.statusTime}>
              Placée le {formatDate(order.created_at)} à {formatTime(order.created_at)}
            </Text>
            {/* Restaurant */}
            <View style={styles.restaurantRow}>
              <MaterialIcons name="store" size={20} color="#E31837" />
              <Text style={styles.restaurantName}>{order.business_name}</Text>
            </View>
            {/* Articles commandés */}
            <View style={styles.itemsContainer}>
              <Text style={styles.itemsTitle}>Articles commandés</Text>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemText}><Text style={styles.itemQuantity}>{item.quantity}x</Text> {item.name}</Text>
                  <Text style={styles.itemPrice}>{((item.price || 0) * (item.quantity || 0)).toLocaleString()} GNF</Text>
                </View>
              ))}
            </View>
            {/* Résumé du paiement */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Résumé du paiement</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total</Text>
                <Text style={styles.summaryValue}>{(order.total || 0).toLocaleString()} GNF</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais de service (2%)</Text>
                <Text style={styles.summaryValue}>{(order.tax || 0).toLocaleString()} GNF</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais de livraison</Text>
                <Text style={styles.summaryValue}>{(order.delivery_fee || 0).toLocaleString()} GNF</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{(order.grand_total || 0).toLocaleString()} GNF</Text>
              </View>
            </View>
            {/* Informations de livraison */}
            {order.delivery_method === 'delivery' && (
              <View style={styles.deliveryContainer}>
                <Text style={styles.deliveryTitle}>Informations de livraison</Text>
                <View style={styles.deliveryInfo}>
                  <MaterialIcons name="location-on" size={20} color="#E31837" />
                  <View style={styles.deliveryTextContainer}>
                    <Text style={styles.deliveryLabel}>Adresse</Text>
                    <Text style={styles.deliveryAddress}>{order.delivery_address}</Text>
                  </View>
                </View>
                {order.delivery_instructions && (
                  <View style={styles.deliveryInfo}>
                    <MaterialIcons name="info" size={20} color="#E31837" />
                    <View style={styles.deliveryTextContainer}>
                      <Text style={styles.deliveryLabel}>Instructions</Text>
                      <Text style={styles.deliveryInstructions}>{order.delivery_instructions}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleTrackOrder}>
            <MaterialIcons name="local-shipping" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Suivre la commande</Text>
            <MaterialIcons name="chevron-right" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrders}>
            <MaterialIcons name="receipt" size={20} color="#E31837" />
            <Text style={styles.secondaryButtonText}>Voir mes commandes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={handleGoHome}>
            <MaterialIcons name="home" size={20} color="#666" />
            <Text style={styles.ghostButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
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
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  orderNumberCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E31837',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    padding: 20,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'left',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemQuantity: {
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31837',
  },
  deliveryContainer: {
    marginBottom: 20,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
  },
  deliveryInstructions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#E31837',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E31837',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#E31837',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  ghostButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
}); 