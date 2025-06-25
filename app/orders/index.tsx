import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '../../hooks/useOrders';

const { width } = Dimensions.get('window');

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface LocalOrder {
  id: string;
  date: Date;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  businessName: string;
  deliveryAddress: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: string;
  estimatedDelivery: Date;
  driverName?: string;
  driverPhone?: string;
}

// Helper function to get status badge color
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return '#fff3cd';
    case 'confirmed': return '#d1ecf1';
    case 'preparing': return '#d4edda';
    case 'ready': return '#d1ecf1';
    case 'picked_up': return '#e2e3e5';
    case 'delivered': return '#d4edda';
    case 'cancelled': return '#f8d7da';
    default: return '#f3f4f6';
  }
};

const getStatusTextColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return '#856404';
    case 'confirmed': return '#0c5460';
    case 'preparing': return '#155724';
    case 'ready': return '#0c5460';
    case 'picked_up': return '#383d41';
    case 'delivered': return '#155724';
    case 'cancelled': return '#721c24';
    default: return '#6b7280';
  }
};

// Helper function to get status icon
const StatusIcon = ({ status, size = 16 }: { status: OrderStatus; size?: number }) => {
  switch (status) {
    case 'pending': return <Ionicons name="time-outline" size={size} color={getStatusTextColor(status)} />;
    case 'confirmed': return <Ionicons name="checkmark-circle-outline" size={size} color={getStatusTextColor(status)} />;
    case 'preparing': return <Ionicons name="time-outline" size={size} color={getStatusTextColor(status)} />;
    case 'ready': return <Ionicons name="checkmark-circle-outline" size={size} color={getStatusTextColor(status)} />;
    case 'picked_up': return <Ionicons name="car-outline" size={size} color={getStatusTextColor(status)} />;
    case 'delivered': return <Ionicons name="checkmark-circle" size={size} color={getStatusTextColor(status)} />;
    case 'cancelled': return <Ionicons name="close-circle" size={size} color={getStatusTextColor(status)} />;
    default: return <Ionicons name="time-outline" size={size} color={getStatusTextColor(status)} />;
  }
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, loading, error, cancelOrder, rateOrder } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'past3months' | 'older'>('all');

  // Convertir les commandes vers le format local
  const localOrders: LocalOrder[] = useMemo(() => orders.map(order => ({
    id: order.id,
    date: new Date(order.created_at),
    total: order.grand_total,
    status: order.status,
    items: order.items || [],
    businessName: order.business_name,
    deliveryAddress: order.delivery_address || '',
    deliveryMethod: order.delivery_method,
    paymentMethod: order.payment_method,
    estimatedDelivery: new Date(order.estimated_delivery || order.created_at),
    driverName: order.driver_name,
    driverPhone: order.driver_phone
  })), [orders]);

  // Filter orders based on selected filter and search term
  const filteredOrders = useMemo(() => localOrders.filter((order) => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  }), [localOrders, filter, searchTerm]);

  // Group orders by time period
  const { recentOrders, past3MonthsOrders, olderOrders } = useMemo(() => {
    const currentDate = new Date();
    const last30Days = new Date(currentDate);
    last30Days.setDate(currentDate.getDate() - 30);
    
    const last90Days = new Date(currentDate);
    last90Days.setDate(currentDate.getDate() - 90);

    const recent = filteredOrders.filter(order => order.date >= last30Days);
    const past3Months = filteredOrders.filter(order => order.date >= last90Days && order.date < last30Days);
    const older = filteredOrders.filter(order => order.date < last90Days);

    return { recentOrders: recent, past3MonthsOrders: past3Months, olderOrders: older };
  }, [filteredOrders]);

  // Get orders for current tab
  const getCurrentTabOrders = () => {
    switch (activeTab) {
      case 'recent': return recentOrders;
      case 'past3months': return past3MonthsOrders;
      case 'older': return olderOrders;
      default: return filteredOrders;
    }
  };

  // Handle view order details
  const handleViewOrderDetails = useCallback((order: LocalOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  // Handle cancel order
  const handleCancelOrder = useCallback(async (orderId: string) => {
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
            if (result.success) {
              setShowOrderDetails(false);
              setSelectedOrder(null);
              Alert.alert('Succès', 'Commande annulée avec succès');
            } else {
              Alert.alert('Erreur', result.error || 'Erreur lors de l\'annulation');
            }
          },
        },
      ]
    );
  }, [cancelOrder]);

  const handleBack = () => {
    router.back();
  };

  const renderOrderItem = ({ item }: { item: LocalOrder }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleViewOrderDetails(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.businessName}>{item.businessName}</Text>
          <Text style={styles.orderDate}>Commande #{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <StatusIcon status={item.status} />
          <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
            {item.status === 'pending' && 'En attente'}
            {item.status === 'confirmed' && 'Confirmée'}
            {item.status === 'preparing' && 'En préparation'}
            {item.status === 'ready' && 'Prête'}
            {item.status === 'picked_up' && 'En livraison'}
            {item.status === 'delivered' && 'Livrée'}
            {item.status === 'cancelled' && 'Annulée'}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderTotal}>
          Total: {formatCurrency(item.total)}
        </Text>
        <Text style={styles.itemsCount}>
          {item.items.length} {item.items.length === 1 ? 'article' : 'articles'}
        </Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>Voir les détails</Text>
          <Feather name="chevron-right" size={16} color="#E31837" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="receipt-long" size={64} color="#999" />
      <Text style={styles.emptyTitle}>Aucune commande trouvée</Text>
      <Text style={styles.emptyText}>
        {searchTerm || filter !== 'all' 
          ? 'Aucune commande ne correspond à vos critères de recherche.'
          : "Vous n'avez pas encore passé de commande."}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Mes Commandes</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de vos commandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Mes Commandes</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#E31837" />
          <Text style={styles.errorText}>Erreur: {error}</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Commandes</Text>
      </View>

      <View style={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher des commandes..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                Toutes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
              onPress={() => setFilter('pending')}
            >
              <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                En attente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'delivered' && styles.filterButtonActive]}
              onPress={() => setFilter('delivered')}
            >
              <Text style={[styles.filterText, filter === 'delivered' && styles.filterTextActive]}>
                Livrées
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.tabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                Toutes ({filteredOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
              onPress={() => setActiveTab('recent')}
            >
              <Text style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>
                Récentes ({recentOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'past3months' && styles.tabActive]}
              onPress={() => setActiveTab('past3months')}
            >
              <Text style={[styles.tabText, activeTab === 'past3months' && styles.tabTextActive]}>
                3 mois ({past3MonthsOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'older' && styles.tabActive]}
              onPress={() => setActiveTab('older')}
            >
              <Text style={[styles.tabText, activeTab === 'older' && styles.tabTextActive]}>
                Anciennes ({olderOrders.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Orders List */}
        <FlatList
          data={getCurrentTabOrders()}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          style={styles.ordersList}
          contentContainerStyle={styles.ordersListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {/* Order Details Modal */}
      <Modal
        visible={showOrderDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedOrder && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowOrderDetails(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Détails de la commande</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Order Status */}
              <View style={styles.modalSection}>
                <View style={styles.statusSection}>
                  <View style={styles.statusInfo}>
                    <StatusIcon status={selectedOrder.status} size={24} />
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                      <Text style={[styles.statusText, { color: getStatusTextColor(selectedOrder.status) }]}>
                        {selectedOrder.status === 'pending' && 'En attente'}
                        {selectedOrder.status === 'confirmed' && 'Confirmée'}
                        {selectedOrder.status === 'preparing' && 'En préparation'}
                        {selectedOrder.status === 'ready' && 'Prête'}
                        {selectedOrder.status === 'picked_up' && 'En livraison'}
                        {selectedOrder.status === 'delivered' && 'Livrée'}
                        {selectedOrder.status === 'cancelled' && 'Annulée'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderTotal}>Total: {formatCurrency(selectedOrder.total)}</Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Articles commandés</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
                      {item.specialInstructions && (
                        <Text style={styles.itemNote}>Note: {item.specialInstructions}</Text>
                      )}
                    </View>
                    <Text style={styles.itemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Delivery Information */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Informations de livraison</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Adresse:</Text> {selectedOrder.deliveryAddress}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Méthode:</Text> {selectedOrder.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Restaurant:</Text> {selectedOrder.businessName}
                  </Text>
                  {selectedOrder.driverName && (
                    <Text style={styles.infoText}>
                      <Text style={styles.infoLabel}>Livreur:</Text> {selectedOrder.driverName}
                    </Text>
                  )}
                  {selectedOrder.driverPhone && (
                    <Text style={styles.infoText}>
                      <Text style={styles.infoLabel}>Téléphone livreur:</Text> {selectedOrder.driverPhone}
                    </Text>
                  )}
                </View>
              </View>

              {/* Payment Information */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Informations de paiement</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Méthode:</Text> {selectedOrder.paymentMethod}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Livraison estimée:</Text> {formatDate(selectedOrder.estimatedDelivery)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              {selectedOrder.status === 'pending' && (
                <View style={styles.modalSection}>
                  <TouchableOpacity 
                    style={styles.cancelOrderButton}
                    onPress={() => handleCancelOrder(selectedOrder.id)}
                  >
                    <Text style={styles.cancelOrderButtonText}>Annuler la commande</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
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
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E31837',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#E31837',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  tabActive: {
    backgroundColor: '#E31837',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    paddingHorizontal: 16,
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
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemsCount: {
    fontSize: 13,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#E31837',
    fontWeight: '500',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  itemNote: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '600',
  },
  cancelOrderButton: {
    backgroundColor: '#E31837',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 