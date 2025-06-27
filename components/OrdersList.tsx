import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOrders } from '../hooks/useOrders';
import OrdersSkeleton from './OrdersSkeleton';

const OrdersList = () => {
  const { orders, loading, error, cancelOrder, rateOrder } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#f97316';
      case 'ready': return '#10b981';
      case 'picked_up': return '#8b5cf6';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'picked_up': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelOrder(orderId);
            if (!result.error) {
              Alert.alert('Succès', 'Commande annulée avec succès');
            } else {
              Alert.alert('Erreur', result.error || 'Erreur lors de l\'annulation');
            }
          },
        },
      ]
    );
  };

  const handleRateOrder = (orderId: string) => {
    Alert.prompt(
      'Noter la commande',
      'Donnez une note de 1 à 5 étoiles',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Noter',
          onPress: async (rating) => {
            const numRating = parseInt(rating || '0');
            if (numRating >= 1 && numRating <= 5) {
              const result = await rateOrder(orderId, numRating);
              if (result.success) {
                Alert.alert('Succès', 'Commande notée avec succès');
              } else {
                Alert.alert('Erreur', result.error || 'Erreur lors de la notation');
              }
            } else {
              Alert.alert('Erreur', 'La note doit être entre 1 et 5');
            }
          },
        },
      ],
      'plain-text',
      '5'
    );
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.businessName}>{item.business_name}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderTotal}>
          Total: {item.grand_total.toLocaleString()} CFA
        </Text>
        <Text style={styles.paymentMethod}>
          Paiement: {item.payment_method === 'cash' ? 'Espèces' : item.payment_method}
        </Text>
      </View>

      {item.items && item.items.length > 0 && (
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Articles:</Text>
          {item.items.slice(0, 3).map((item: any, index: number) => (
            <Text key={index} style={styles.itemText}>
              • {item.name || 'Article'} x{item.quantity}
            </Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>+{item.items.length - 3} autres articles</Text>
          )}
        </View>
      )}

      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(item.id)}
          >
            <MaterialIcons name="cancel" size={16} color="#ef4444" />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}

        {item.status === 'delivered' && !item.customer_rating && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => handleRateOrder(item.id)}
          >
            <MaterialIcons name="star" size={16} color="#f59e0b" />
            <Text style={styles.rateButtonText}>Noter</Text>
          </TouchableOpacity>
        )}

        {item.customer_rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              Votre note: {item.customer_rating}/5 ⭐
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return <OrdersSkeleton count={5} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="receipt-long" size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Aucune commande</Text>
        <Text style={styles.emptyText}>
          Vous n'avez pas encore passé de commande.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 4,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  rateButtonText: {
    fontSize: 14,
    color: '#f59e0b',
    marginLeft: 4,
  },
  ratingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
});

export default OrdersList; 