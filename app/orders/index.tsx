import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrdersSkeleton from '../../components/OrdersSkeleton';
import SyncStatus from '../../components/SyncStatus';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';
import { Order } from '../../lib/services/OrderService';
import { formatDate, formatPrice } from '../../lib/utils';

export default function OrdersScreen() {
  const { orders, loading, error, refetch, cancelOrder, rateOrder } = useOrders();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      showToast('success', 'Commandes actualisées');
    } catch (error) {
      showToast('error', 'Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            setCancellingOrder(orderId);
            try {
              const { error } = await cancelOrder(orderId);
              if (error) {
                showToast('error', error);
              } else {
                showToast('success', 'Commande annulée avec succès');
              }
            } catch (err) {
              showToast('error', 'Erreur lors de l\'annulation');
            } finally {
              setCancellingOrder(null);
            }
          },
        },
      ]
    );
  };

  const handleRateOrder = async (orderId: string, rating: number, review?: string) => {
    setRatingOrder(orderId);
    try {
      const { success, error } = await rateOrder(orderId, rating, review);
      if (success) {
        showToast('success', 'Avis ajouté avec succès');
      } else {
        showToast('error', error || 'Erreur lors de l\'ajout de l\'avis');
      }
    } catch (err) {
      showToast('error', 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setRatingOrder(null);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const statusColors = {
      pending: '#FFA500',
      confirmed: '#007AFF',
      preparing: '#FF6B35',
      ready: '#28A745',
      picked_up: '#17A2B8',
      delivered: '#6C757D',
      cancelled: '#DC3545',
    };
    return statusColors[status] || '#6C757D';
  };

  const getStatusText = (status: Order['status']) => {
    const statusTexts = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      ready: 'Prête',
      picked_up: 'En livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return statusTexts[status] || status;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
          <Text style={styles.businessName}>{item.business_name}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Articles ({item.items.length})</Text>
          {item.items.slice(0, 3).map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              {orderItem.image && (
                <Image
                  source={{ uri: orderItem.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemText}>
                  • {orderItem.name} x{orderItem.quantity}
                </Text>
                {orderItem.special_instructions && (
                  <Text style={styles.itemInstructions}>
                    Note: {orderItem.special_instructions}
                  </Text>
                )}
              </View>
            </View>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>+{item.items.length - 3} autres articles</Text>
          )}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total:</Text>
            <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
          </View>
          {item.delivery_fee > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Livraison:</Text>
              <Text style={styles.totalValue}>{formatPrice(item.delivery_fee)}</Text>
            </View>
          )}
          {item.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxes:</Text>
              <Text style={styles.totalValue}>{formatPrice(item.tax)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(item.grand_total)}</Text>
          </View>
        </View>

        {item.delivery_address && (
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Adresse de livraison</Text>
            <Text style={styles.deliveryAddress}>{item.delivery_address}</Text>
          </View>
        )}

        {item.customer_rating && (
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Votre avis</Text>
            <View style={styles.ratingDisplay}>
              <Text style={styles.stars}>{'⭐'.repeat(item.customer_rating)}</Text>
              {item.customer_review && (
                <Text style={styles.reviewText}>{item.customer_review}</Text>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.orderActions}>
        {['pending', 'confirmed'].includes(item.status) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelOrder(item.id)}
            disabled={cancellingOrder === item.id}
          >
            {cancellingOrder === item.id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Annuler</Text>
            )}
          </TouchableOpacity>
        )}

        {item.status === 'delivered' && !item.customer_rating && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rateButton]}
            onPress={() => {
              // Ici vous pourriez ouvrir un modal pour la notation
              handleRateOrder(item.id, 5, 'Très satisfait !');
            }}
            disabled={ratingOrder === item.id}
          >
            {ratingOrder === item.id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.rateButtonText}>Noter</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => {
            // Navigation vers les détails de la commande
            console.log('Voir détails de la commande:', item.id);
          }}
        >
          <Text style={styles.detailsButtonText}>Détails</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes Commandes</Text>
          <SyncStatus />
        </View>
        <OrdersSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes</Text>
        <SyncStatus />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {orders.length === 0 && !loading && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore passé de commande. Parcourez nos commerces et découvrez nos délicieuses offres !
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#000000"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
    color: '#666',
  },
  listContainer: {
    padding: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    color: '#000',
  },
  businessName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    color: '#000',
  },
  orderDate: {
    fontSize: 11,
    opacity: 0.6,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  orderDetails: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  itemsSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 12,
    marginBottom: 1,
    color: '#000',
  },
  itemInstructions: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 1,
  },
  moreItems: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 2,
  },
  totalsSection: {
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 12,
    color: '#000',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 4,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  deliverySection: {
    marginBottom: 8,
  },
  deliveryAddress: {
    fontSize: 12,
    opacity: 0.7,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 8,
  },
  ratingDisplay: {
    alignItems: 'flex-start',
  },
  stars: {
    fontSize: 14,
    marginBottom: 2,
  },
  reviewText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#DC3545',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  rateButton: {
    backgroundColor: '#FFC107',
  },
  rateButtonText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#007AFF',
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
}); 