import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Linking,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderItemsList from '../../components/OrderItemsList';
import OrdersPageSkeleton from '../../components/OrdersPageSkeleton';
import { useOrders } from '../../hooks/useOrders';

const { width } = Dimensions.get('window');

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  image?: string;
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
  customer_rating?: number;
  customer_review?: string;
  // Champs pour les commandes groupées
  is_grouped?: boolean;
  group_orders?: LocalOrder[];
  group_total?: number;
  group_delivery_fee?: number;
}

// Helper function to get status badge color
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return '#fff3cd';
    case 'confirmed': return '#d1ecf1';
    case 'preparing': return '#d4edda';
    case 'ready': return '#d1ecf1';
    case 'out_for_delivery': return '#e9d5ff';
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
    case 'out_for_delivery': return '#581c87';
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
    case 'out_for_delivery': return <Ionicons name="car-outline" size={size} color={getStatusTextColor(status)} />;
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

// Helper function to get status text (harmonisé avec le site web)
const getStatusText = (status: OrderStatus) => {
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

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, loading, error, cancelOrder, rateOrder, refreshOrders } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<LocalOrder | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'past3months' | 'older'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Debug: Afficher les commandes reçues
  console.log('🔍 DEBUG - Commandes reçues du hook:', orders);
  console.log('🔍 DEBUG - Nombre de commandes:', orders.length);
  console.log('🔍 DEBUG - Premier ordre (si existe):', orders[0]);

  // Convertir les commandes vers le format local
  const localOrders: LocalOrder[] = useMemo(() => orders.map(order => ({
    id: order.id,
    date: new Date(order.created_at),
    total: order.grand_total,
    status: order.status,
    items: (order.items || []).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      specialInstructions: item.special_instructions,
      image: item.image
    })),
    businessName: order.business_name || (order.business_id ? `Business ${order.business_id}` : 'Business inconnu'),
    deliveryAddress: order.delivery_address || '',
    deliveryMethod: order.delivery_method,
    paymentMethod: order.payment_method,
    estimatedDelivery: new Date(order.estimated_delivery || order.created_at),
    driverName: undefined, // driver_name n'existe pas
    driverPhone: undefined, // driver_phone n'existe pas
    customer_rating: order.customer_rating,
    customer_review: order.customer_review,
    // Champs pour les commandes groupées
    is_grouped: order.is_grouped || false,
    group_orders: order.group_orders || [],
    group_total: order.group_total || order.grand_total,
    group_delivery_fee: order.group_delivery_fee || order.delivery_fee
  })), [orders]);

  console.log('🔍 DEBUG - Commandes converties:', localOrders.length);

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

  // Fonction de gestion du refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
    } catch (error) {
      console.error('Erreur lors du refresh des commandes:', error);
    } finally {
      setRefreshing(false);
    }
  };

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
            if (!result.error) {
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

  // Handle open rating modal
  const handleOpenRating = useCallback((order: LocalOrder) => {
    setRatingOrder(order);
    setRating(0);
    setComment('');
    setShowRatingModal(true);
  }, []);

  // Handle submit rating
  const handleSubmitRating = useCallback(async () => {
    if (!ratingOrder || rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note entre 1 et 5 étoiles');
      return;
    }

    try {
      const result = await rateOrder(ratingOrder.id, rating, comment);
      if (result.success) {
        setShowRatingModal(false);
        setRatingOrder(null);
        setRating(0);
        setComment('');
        Alert.alert('Succès', 'Votre avis a été enregistré avec succès');
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de l\'enregistrement de l\'avis');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement de l\'avis');
    }
  }, [ratingOrder, rating, comment, rateOrder]);

  const handleBack = () => {
    router.back();
  };

  // Fonction pour appeler le chauffeur
  const handleCallDriver = useCallback(async (phoneNumber: string) => {
    try {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'appeler le chauffeur');
    }
  }, []);

  const renderOrderItem = ({ item }: { item: LocalOrder }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleViewOrderDetails(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <View style={styles.businessNameContainer}>
            <Text style={styles.businessName}>{item.businessName}</Text>
            {item.is_grouped && (
              <View style={styles.groupedBadge}>
                <MaterialIcons name="group" size={12} color="#fff" />
                <Text style={styles.groupedBadgeText}>Groupée</Text>
              </View>
            )}
          </View>
          <Text style={styles.orderDate}>Commande #{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <StatusIcon status={item.status} />
          <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderTotal}>
          Total: {formatCurrency(item.is_grouped ? (item.group_total || item.total) : item.total)}
        </Text>
        <Text style={styles.itemsCount}>
          {item.items.length} {item.items.length === 1 ? 'article' : 'articles'}
          {item.is_grouped && item.group_orders && (
            <Text style={styles.groupedInfo}>
              {' '}({item.group_orders.length} services)
            </Text>
          )}
        </Text>
        
        {/* Aperçu des items */}
        {item.items.length > 0 && (
          <View style={styles.itemsPreview}>
            <OrderItemsList 
              items={item.items.slice(0, 2)} // Afficher seulement les 2 premiers items
              showImages={false}
              compact={true}
            />
            {item.items.length > 2 && (
              <Text style={styles.moreItemsText}>
                +{item.items.length - 2} autres articles...
              </Text>
            )}
          </View>
        )}

        {/* Aperçu des services groupés */}
        {item.is_grouped && item.group_orders && item.group_orders.length > 0 && (
          <View style={styles.groupedServicesPreview}>
            <Text style={styles.groupedServicesTitle}>Services inclus:</Text>
            {item.group_orders.slice(0, 2).map((groupOrder, index) => (
              <Text key={index} style={styles.groupedServiceItem}>
                • {groupOrder.businessName}
              </Text>
            ))}
            {item.group_orders.length > 2 && (
              <Text style={styles.moreServicesText}>
                +{item.group_orders.length - 2} autres services...
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>Voir les détails</Text>
          <Feather name="chevron-right" size={16} color="#E31837" />
        </TouchableOpacity>
        
        {item.status === 'delivered' && !item.customer_rating && (
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => handleOpenRating(item)}
          >
            <MaterialIcons name="star" size={16} color="#f59e0b" />
            <Text style={styles.rateButtonText}>Noter</Text>
          </TouchableOpacity>
        )}
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
        <OrdersPageSkeleton />
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

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E31837']}
            tintColor="#E31837"
          />
        }
      >
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
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
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
              style={[styles.filterButton, filter === 'preparing' && styles.filterButtonActive]}
              onPress={() => setFilter('preparing')}
            >
              <Text style={[styles.filterText, filter === 'preparing' && styles.filterTextActive]}>
                En préparation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'ready' && styles.filterButtonActive]}
              onPress={() => setFilter('ready')}
            >
              <Text style={[styles.filterText, filter === 'ready' && styles.filterTextActive]}>
                Prêtes
              </Text>
            </TouchableOpacity>
                         <TouchableOpacity 
               style={[styles.filterButton, filter === 'out_for_delivery' && styles.filterButtonActive]}
               onPress={() => setFilter('out_for_delivery')}
             >
               <Text style={[styles.filterText, filter === 'out_for_delivery' && styles.filterTextActive]}>
                 En cours de livraison
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
          </ScrollView>
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
          scrollEnabled={false}
        />
      </ScrollView>

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
                        {getStatusText(selectedOrder.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderTotal}>Total: {formatCurrency(selectedOrder.total)}</Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>
                  {selectedOrder.is_grouped ? 'Articles des services groupés' : 'Articles commandés'}
                </Text>
                
                {/* Afficher les services groupés si c'est une commande groupée */}
                {selectedOrder.is_grouped && selectedOrder.group_orders && (
                  <View style={styles.groupedServicesSection}>
                    <Text style={styles.groupedServicesSectionTitle}>
                      Services inclus ({selectedOrder.group_orders.length}):
                    </Text>
                    {selectedOrder.group_orders.map((groupOrder, index) => (
                      <View key={index} style={styles.groupedServiceCard}>
                        <Text style={styles.groupedServiceName}>{groupOrder.businessName}</Text>
                        <Text style={styles.groupedServiceTotal}>
                          {formatCurrency(groupOrder.total)}
                        </Text>
                      </View>
                    ))}
                    <View style={styles.groupedTotalCard}>
                      <Text style={styles.groupedTotalLabel}>Total groupé:</Text>
                      <Text style={styles.groupedTotalValue}>
                        {formatCurrency(selectedOrder.group_total || selectedOrder.total)}
                      </Text>
                    </View>
                  </View>
                )}
                
                <OrderItemsList 
                  items={selectedOrder.items}
                  showImages={true}
                  compact={false}
                />
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
                    <>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Téléphone livreur:</Text> {selectedOrder.driverPhone}
                      </Text>
                      <TouchableOpacity 
                        style={styles.callDriverButton}
                        onPress={() => handleCallDriver(selectedOrder.driverPhone!)}
                      >
                        <Ionicons name="call" size={16} color="#fff" />
                        <Text style={styles.callDriverButtonText}>Appeler le chauffeur</Text>
                      </TouchableOpacity>
                    </>
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

              {selectedOrder.status === 'delivered' && !selectedOrder.customer_rating && (
                <View style={styles.modalSection}>
                  <TouchableOpacity 
                    style={styles.rateOrderButton}
                    onPress={() => {
                      setShowOrderDetails(false);
                      handleOpenRating(selectedOrder);
                    }}
                  >
                    <MaterialIcons name="star" size={20} color="#f59e0b" />
                    <Text style={styles.rateOrderButtonText}>Noter cette commande</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedOrder.customer_rating && (
                <View style={styles.modalSection}>
                  <View style={styles.ratingDisplay}>
                    <Text style={styles.sectionTitle}>Votre avis</Text>
                    <View style={styles.starsDisplay}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MaterialIcons
                          key={star}
                          name={(selectedOrder.customer_rating || 0) >= star ? "star" : "star-border"}
                          size={20}
                          color={(selectedOrder.customer_rating || 0) >= star ? "#f59e0b" : "#d1d5db"}
                        />
                      ))}
                    </View>
                    {selectedOrder.customer_review && (
                      <Text style={styles.reviewText}>{selectedOrder.customer_review}</Text>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowRatingModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Noter votre commande</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {ratingOrder && (
              <>
                {/* Order Info */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Commande #{ratingOrder.id}</Text>
                  <Text style={styles.businessNameText}>{ratingOrder.businessName}</Text>
                  <Text style={styles.orderDateText}>{formatDate(ratingOrder.date)}</Text>
                </View>

                {/* Rating Stars */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Votre note</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                      >
                        <MaterialIcons
                          name={rating >= star ? "star" : "star-border"}
                          size={32}
                          color={rating >= star ? "#f59e0b" : "#d1d5db"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.ratingText}>
                    {rating === 0 && "Sélectionnez une note"}
                    {rating === 1 && "Très mauvais"}
                    {rating === 2 && "Mauvais"}
                    {rating === 3 && "Moyen"}
                    {rating === 4 && "Bon"}
                    {rating === 5 && "Excellent"}
                  </Text>
                </View>

                {/* Comment */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Votre commentaire (optionnel)</Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Partagez votre expérience..."
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Submit Button */}
                <View style={styles.modalSection}>
                  <TouchableOpacity 
                    style={[styles.submitRatingButton, rating === 0 && styles.submitRatingButtonDisabled]}
                    onPress={handleSubmitRating}
                    disabled={rating === 0}
                  >
                    <Text style={styles.submitRatingButtonText}>Envoyer l'avis</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
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
  filterScroll: {
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    minWidth: 80,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
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
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  rateButtonText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
    marginLeft: 4,
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
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
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
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
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
  businessNameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  orderDateText: {
    fontSize: 13,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  commentInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 12,
  },
  submitRatingButton: {
    backgroundColor: '#E31837',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitRatingButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  submitRatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rateOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  rateOrderButtonText: {
    color: '#92400e',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  ratingDisplay: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  starsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  callDriverButton: {
    backgroundColor: '#E31837',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  callDriverButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemsPreview: {
    marginTop: 8,
  },
  moreItemsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  businessNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  groupedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31837',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  groupedBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 2,
  },
  groupedInfo: {
    fontSize: 12,
    color: '#E31837',
    fontWeight: '500',
  },
  groupedServicesPreview: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  groupedServicesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  groupedServiceItem: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  moreServicesText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  groupedServicesSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  groupedServicesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  groupedServiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 4,
  },
  groupedServiceName: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  groupedServiceTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E31837',
  },
  groupedTotalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#E31837',
    borderRadius: 6,
    marginTop: 4,
  },
  groupedTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  groupedTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 