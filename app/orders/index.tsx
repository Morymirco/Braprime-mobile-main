import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
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

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

export default function OrdersScreen() {
  const { orders, loading, error, refetch, cancelOrder, rateOrder } = useOrders();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Filtrer les commandes selon l'onglet actif
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return orders.filter(order => 
          ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
        );
      case 'delivered':
        return orders.filter(order => order.status === 'delivered');
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  }, [orders, activeTab]);

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

  const getStatusColor = (status: Order['status']) => {
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

  const getStatusLabel = (status: Order['status']) => {
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
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            setCancellingOrder(orderId);
            try {
              const result = await cancelOrder(orderId);
              if (result.success) {
                showToast('success', 'Commande annulée avec succès');
              } else {
                showToast('error', result.error || 'Erreur lors de l\'annulation');
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
              setRatingOrder(orderId);
              try {
                const result = await rateOrder(orderId, numRating);
                if (result.success) {
                  showToast('success', 'Commande notée avec succès');
                } else {
                  showToast('error', result.error || 'Erreur lors de la notation');
                }
              } catch (err) {
                showToast('error', 'Erreur lors de la notation');
              } finally {
                setRatingOrder(null);
              }
            } else {
              showToast('error', 'La note doit être entre 1 et 5');
            }
          },
        },
      ],
      'plain-text',
      '5'
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
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
      )}

      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(item.id)}
            disabled={cancellingOrder === item.id}
          >
            {cancellingOrder === item.id ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <MaterialIcons name="cancel" size={16} color="#ef4444" />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {item.status === 'delivered' && !item.customer_rating && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => handleRateOrder(item.id)}
            disabled={ratingOrder === item.id}
          >
            {ratingOrder === item.id ? (
              <ActivityIndicator size="small" color="#f59e0b" />
            ) : (
              <>
                <MaterialIcons name="star" size={16} color="#f59e0b" />
                <Text style={styles.rateButtonText}>Noter</Text>
              </>
            )}
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

  const renderTabButton = (tab: FilterTab, label: string, count: number) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
      <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
        <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes Commandes</Text>
          <SyncStatus />
        </View>
        <OrdersSkeleton count={5} />
      </SafeAreaView>
    );
  }

  // Compter les commandes par statut
  const activeCount = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
  ).length;
  const deliveredCount = orders.filter(order => order.status === 'delivered').length;
  const cancelledCount = orders.filter(order => order.status === 'cancelled').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes</Text>
        <SyncStatus />
      </View>

      {/* Onglets de filtre */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {renderTabButton('all', 'Toutes', orders.length)}
        {renderTabButton('active', 'En cours', activeCount)}
        {renderTabButton('delivered', 'Livrées', deliveredCount)}
        {renderTabButton('cancelled', 'Annulées', cancelledCount)}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Erreur: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredOrders.length === 0 && !loading && !error ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt-long" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {activeTab === 'all' ? 'Aucune commande' : 
             activeTab === 'active' ? 'Aucune commande en cours' :
             activeTab === 'delivered' ? 'Aucune commande livrée' :
             'Aucune commande annulée'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'all' ? 
              'Vous n\'avez pas encore passé de commande.' :
              'Aucune commande ne correspond à ce filtre pour le moment.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={styles.contentContainer}
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
    backgroundColor: '#f8f9fa',
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
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
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
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemInstructions: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 1,
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