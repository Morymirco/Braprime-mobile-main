import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
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
import PackageOrdersSkeleton from '../components/PackageOrdersSkeleton';
import { useAuth } from '../lib/contexts/AuthContext';
import { PackageOrderService } from '../lib/services/PackageOrderService';

const { width } = Dimensions.get('window');

type PackageOrderStatus = 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

interface PackageOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  packageDetails?: {
    weight: string;
    dimensions: string;
    description: string;
    isFragile: boolean;
    isUrgent: boolean;
  };
}

interface PackageOrder {
  id: string;
  date: Date;
  total: number;
  status: PackageOrderStatus;
  items: PackageOrderItem[];
  businessName: string;
  serviceName: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  deliveryPreferences: {
    preferredTime?: string;
    pickupDate?: string;
    pickupTime?: string;
    dropDate?: string;
    dropTime?: string;
    contactMethod: 'phone' | 'email' | 'both';
  };
}

// Helper function to get status badge color
const getStatusColor = (status: PackageOrderStatus) => {
  switch (status) {
    case 'pending': return '#fff3cd';
    case 'confirmed': return '#d1ecf1';
    case 'picked_up': return '#e2e3e5';
    case 'in_transit': return '#e9d5ff';
    case 'delivered': return '#d4edda';
    case 'cancelled': return '#f8d7da';
    default: return '#f3f4f6';
  }
};

const getStatusTextColor = (status: PackageOrderStatus) => {
  switch (status) {
    case 'pending': return '#856404';
    case 'confirmed': return '#0c5460';
    case 'picked_up': return '#383d41';
    case 'in_transit': return '#581c87';
    case 'delivered': return '#155724';
    case 'cancelled': return '#721c24';
    default: return '#6b7280';
  }
};

// Helper function to get status icon
const StatusIcon = ({ status, size = 16 }: { status: PackageOrderStatus; size?: number }) => {
  switch (status) {
    case 'pending': return <Ionicons name="time-outline" size={size} color={getStatusTextColor(status)} />;
    case 'confirmed': return <Ionicons name="checkmark-circle-outline" size={size} color={getStatusTextColor(status)} />;
    case 'picked_up': return <MaterialIcons name="local-shipping" size={size} color={getStatusTextColor(status)} />;
    case 'in_transit': return <MaterialIcons name="local-shipping" size={size} color={getStatusTextColor(status)} />;
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

// Fonction pour nettoyer et formater les données
const formatDataValue = (value: any): string => {
  if (value === null || value === undefined) return 'Non spécifié';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Si c'est un objet JSON, essayer d'extraire des informations utiles
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.description) return value.description;
    // Si c'est un objet complexe, afficher une version simplifiée
    return JSON.stringify(value).substring(0, 50) + '...';
  }
  return String(value);
};

// Helper function to get status text
const getStatusText = (status: PackageOrderStatus) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmé';
    case 'picked_up': return 'Récupéré';
    case 'in_transit': return 'En transit';
    case 'delivered': return 'Livré';
    case 'cancelled': return 'Annulé';
    default: return status;
  }
};

export default function PackageOrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [packageOrders, setPackageOrders] = useState<PackageOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PackageOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filter, setFilter] = useState<PackageOrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'past3months' | 'older'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Charger les commandes de colis
  const loadPackageOrders = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Utiliser notre service PackageOrderService (comme le client)
      const packageOrdersData = await PackageOrderService.getUserPackageOrders();

      // Transformer les données du service en format PackageOrder pour l'interface
      const transformedOrders: PackageOrder[] = packageOrdersData.map(order => ({
        id: order.id,
        date: new Date(order.created_at),
        total: order.total_amount,
        status: order.status as PackageOrderStatus,
        items: order.order_items?.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          specialInstructions: item.special_instructions,
          packageDetails: {
            weight: order.package_details?.weight || 'Non spécifié',
            dimensions: order.package_details?.dimensions || 'Non spécifié',
            description: order.package_details?.description || 'Colis standard',
            isFragile: order.package_details?.is_fragile || false,
            isUrgent: order.package_details?.is_urgent || false
          }
        })) || [],
        businessName: 'Service de colis',
        serviceName: order.service_name,
        pickupAddress: order.pickup_address?.address || '',
        deliveryAddress: order.delivery_address?.address || '',
        deliveryMethod: 'delivery' as const,
        paymentMethod: 'cash' as const,
        customerInfo: {
          name: order.customer_info?.name || '',
          phone: order.customer_info?.phone || '',
          email: order.customer_info?.email || ''
        },
        deliveryPreferences: {
          preferredTime: order.delivery_preferences?.preferred_time || '',
          pickupDate: order.delivery_preferences?.pickup_date || '',
          pickupTime: order.delivery_preferences?.pickup_time || '',
          dropDate: order.delivery_preferences?.drop_date || '',
          dropTime: order.delivery_preferences?.drop_time || '',
          contactMethod: (order.delivery_preferences?.contact_method as 'phone' | 'email' | 'both') || 'phone'
        }
      }));

      console.log('🔍 DEBUG - Commandes transformées:', transformedOrders.length);
      transformedOrders.forEach(order => {
        console.log('🔍 DEBUG - Commande', order.id.slice(0, 8), 'contient', order.items.length, 'items');
      });

      setPackageOrders(transformedOrders);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des colis:', err);
      setError('Erreur lors du chargement des colis');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Charger les commandes au montage
  React.useEffect(() => {
    loadPackageOrders();
  }, [loadPackageOrders]);

  // Filtrer les commandes
  const filteredOrders = useMemo(() => packageOrders.filter((order) => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }), [packageOrders, filter, searchTerm]);

  // Fonction de gestion du refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPackageOrders();
    } catch (error) {
      console.error('Erreur lors du refresh des colis:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Grouper les commandes par période de temps
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

  // Obtenir les commandes pour l'onglet actuel
  const getCurrentTabOrders = () => {
    switch (activeTab) {
      case 'recent': return recentOrders;
      case 'past3months': return past3MonthsOrders;
      case 'older': return olderOrders;
      default: return filteredOrders;
    }
  };

  const handleOrderPress = (order: PackageOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCallDriver = () => {
    Alert.alert(
      'Appeler le chauffeur',
      'Fonctionnalité à implémenter',
      [{ text: 'OK' }]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const renderOrderItem = ({ item }: { item: PackageOrder }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.businessName}>{formatDataValue(item.businessName)}</Text>
          <Text style={styles.orderDate}>Livraison #{item.id.slice(0, 8)}</Text>
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
          {item.items.length > 1 && (
            <Text style={styles.multiplePackagesText}>
              {item.items.length} colis dans cette livraison
            </Text>
          )}
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
          Total: {formatCurrency(item.total)}
        </Text>
        <Text style={styles.itemsCount}>
          {item.items.length} {item.items.length === 1 ? 'colis' : 'colis'} • {formatCurrency(item.total)} GNF
        </Text>
        
        {/* Informations du colis */}
        {item.items.length > 0 && item.items[0].packageDetails && (
          <View style={styles.packageInfo}>
            <View style={styles.packageDetail}>
              <MaterialIcons name="scale" size={14} color="#666" />
              <Text style={styles.packageDetailText}>
                {item.items.length === 1 
                  ? formatDataValue(item.items[0].packageDetails.weight)
                  : `${item.items.length} colis`
                }
              </Text>
            </View>
            {item.items.length === 1 && item.items[0].packageDetails.dimensions && (
              <View style={styles.packageDetail}>
                <MaterialIcons name="straighten" size={14} color="#666" />
                <Text style={styles.packageDetailText}>{formatDataValue(item.items[0].packageDetails.dimensions)}</Text>
              </View>
            )}
            {item.items.some(item => item.packageDetails?.isFragile) && (
              <View style={styles.packageDetail}>
                <MaterialIcons name="warning" size={14} color="#FF9800" />
                <Text style={[styles.packageDetailText, styles.fragileText]}>Fragile</Text>
              </View>
            )}
            {item.items.some(item => item.packageDetails?.isUrgent) && (
              <View style={styles.packageDetail}>
                <MaterialIcons name="priority-high" size={14} color="#E31837" />
                <Text style={[styles.packageDetailText, styles.urgentText]}>Urgent</Text>
              </View>
            )}
          </View>
        )}
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
      <MaterialIcons name="inventory" size={64} color="#999" />
      <Text style={styles.emptyTitle}>Aucun colis trouvé</Text>
      <Text style={styles.emptyText}>
        {searchTerm || filter !== 'all' 
          ? 'Aucun colis ne correspond à vos critères de recherche.'
          : "Vous n'avez pas encore de colis."}
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
          <Text style={styles.title}>Mes Colis</Text>
        </View>
        <PackageOrdersSkeleton />
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
          <Text style={styles.title}>Mes Colis</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#E31837" />
          <Text style={styles.errorText}>Erreur: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPackageOrders}>
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
        <Text style={styles.title}>Mes Colis</Text>
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
              placeholder="Rechercher des colis..."
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
                Tous
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
              style={[styles.filterButton, filter === 'confirmed' && styles.filterButtonActive]}
              onPress={() => setFilter('confirmed')}
            >
              <Text style={[styles.filterText, filter === 'confirmed' && styles.filterTextActive]}>
                Confirmé
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'picked_up' && styles.filterButtonActive]}
              onPress={() => setFilter('picked_up')}
            >
              <Text style={[styles.filterText, filter === 'picked_up' && styles.filterTextActive]}>
                Récupéré
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'in_transit' && styles.filterButtonActive]}
              onPress={() => setFilter('in_transit')}
            >
              <Text style={[styles.filterText, filter === 'in_transit' && styles.filterTextActive]}>
                En transit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filter === 'delivered' && styles.filterButtonActive]}
              onPress={() => setFilter('delivered')}
            >
              <Text style={[styles.filterText, filter === 'delivered' && styles.filterTextActive]}>
                Livré
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
                Tous ({filteredOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
              onPress={() => setActiveTab('recent')}
            >
              <Text style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>
                Récents ({recentOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'past3months' && styles.tabActive]}
              onPress={() => setActiveTab('past3months')}
            >
              <Text style={[styles.tabText, activeTab === 'past3months' && styles.tabTextActive]}>
                3 derniers mois ({past3MonthsOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'older' && styles.tabActive]}
              onPress={() => setActiveTab('older')}
            >
              <Text style={[styles.tabText, activeTab === 'older' && styles.tabTextActive]}>
                Plus anciens ({olderOrders.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Orders List */}
        {getCurrentTabOrders().length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={getCurrentTabOrders()}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.ordersListContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={showOrderDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOrderDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Détails du colis</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalContent}>
              {/* Order Info */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Informations du colis</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Numéro:</Text>
                  <Text style={styles.infoValue}>#{selectedOrder.id.slice(0, 8)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedOrder.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Statut:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <StatusIcon status={selectedOrder.status} size={14} />
                    <Text style={[styles.statusText, { color: getStatusTextColor(selectedOrder.status) }]}>
                      {getStatusText(selectedOrder.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Business Info */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Service de livraison</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Prestataire:</Text>
                  <Text style={styles.infoValue}>{formatDataValue(selectedOrder.businessName)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type de service:</Text>
                  <Text style={styles.infoValue}>{formatDataValue(selectedOrder.serviceName)}</Text>
                </View>
              </View>

              {/* Addresses */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Adresses de service</Text>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Point de collecte (départ):</Text>
                  <Text style={styles.addressText}>{formatDataValue(selectedOrder.pickupAddress)}</Text>
                </View>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Destination principale:</Text>
                  <Text style={styles.addressText}>{formatDataValue(selectedOrder.deliveryAddress)}</Text>
                </View>
                <Text style={styles.addressNote}>
                  Note: Chaque colis peut avoir sa propre destination spécifique (voir détails ci-dessous)
                </Text>
              </View>

              {/* Package Details */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Caractéristiques du colis</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type de colis:</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder.items[0]?.packageDetails?.isFragile ? 'Fragile' : 
                     selectedOrder.items[0]?.packageDetails?.isUrgent ? 'Express' : 'Standard'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Poids:</Text>
                  <Text style={styles.infoValue}>{formatDataValue(selectedOrder.items[0]?.packageDetails?.weight)} kg</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dimensions:</Text>
                  <Text style={styles.infoValue}>{formatDataValue(selectedOrder.items[0]?.packageDetails?.dimensions)} cm</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Description:</Text>
                  <Text style={styles.infoValue}>{formatDataValue(selectedOrder.items[0]?.packageDetails?.description)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fragile:</Text>
                  <Text style={[styles.infoValue, selectedOrder.items[0]?.packageDetails?.isFragile && styles.fragileText]}>
                    {selectedOrder.items[0]?.packageDetails?.isFragile ? 'Oui' : 'Non'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Urgent:</Text>
                  <Text style={[styles.infoValue, selectedOrder.items[0]?.packageDetails?.isUrgent && styles.urgentText]}>
                    {selectedOrder.items[0]?.packageDetails?.isUrgent ? 'Oui' : 'Non'}
                </Text>
                </View>
              </View>

              {/* Package Items */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Détails des colis ({selectedOrder.items.length})</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>Colis {index + 1}</Text>
                      <View style={styles.itemBadges}>
                        {item.packageDetails?.isFragile && (
                          <View style={[styles.itemBadge, styles.fragileBadge]}>
                            <Text style={styles.itemBadgeText}>Fragile</Text>
                          </View>
                        )}
                        {item.packageDetails?.isUrgent && (
                          <View style={[styles.itemBadge, styles.urgentBadge]}>
                            <Text style={styles.itemBadgeText}>Urgent</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {/* Informations du colis */}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
                      <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                    </View>
                    
                    {/* Caractéristiques du colis */}
                    <View style={styles.itemPackageDetails}>
                      <Text style={styles.itemSectionTitle}>Caractéristiques</Text>
                      <View style={styles.itemDetailRow}>
                        <Text style={styles.itemDetailLabel}>Poids:</Text>
                        <Text style={styles.itemDetailValue}>{formatDataValue(item.packageDetails?.weight)} kg</Text>
                      </View>
                      {item.packageDetails?.dimensions && (
                        <View style={styles.itemDetailRow}>
                          <Text style={styles.itemDetailLabel}>Dimensions:</Text>
                          <Text style={styles.itemDetailValue}>{formatDataValue(item.packageDetails.dimensions)} cm</Text>
                        </View>
                      )}
                      {item.packageDetails?.description && (
                        <View style={styles.itemDetailRow}>
                          <Text style={styles.itemDetailLabel}>Description:</Text>
                          <Text style={styles.itemDetailValue}>{formatDataValue(item.packageDetails.description)}</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Informations destinataire pour ce colis */}
                    <View style={styles.itemRecipientInfo}>
                      <Text style={styles.itemSectionTitle}>Destinataire</Text>
                      <View style={styles.itemDetailRow}>
                        <Text style={styles.itemDetailLabel}>Nom:</Text>
                        <Text style={styles.itemDetailValue}>{formatDataValue(selectedOrder.customerInfo.name)}</Text>
                      </View>
                      <View style={styles.itemDetailRow}>
                        <Text style={styles.itemDetailLabel}>Téléphone:</Text>
                        <Text style={styles.itemDetailValue}>{formatDataValue(selectedOrder.customerInfo.phone)}</Text>
                      </View>
                      <View style={styles.itemDetailRow}>
                        <Text style={styles.itemDetailLabel}>Email:</Text>
                        <Text style={styles.itemDetailValue}>{formatDataValue(selectedOrder.customerInfo.email)}</Text>
                      </View>
                      {item.deliveryAddress && (
                        <View style={styles.itemDetailRow}>
                          <Text style={styles.itemDetailLabel}>Adresse de livraison:</Text>
                          <Text style={styles.itemDetailValue}>{formatDataValue(item.deliveryAddress)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>



              {/* Delivery Preferences */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Horaires de service</Text>
                {selectedOrder.deliveryPreferences.preferredTime && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Heure préférée:</Text>
                    <Text style={styles.infoValue}>{formatDataValue(selectedOrder.deliveryPreferences.preferredTime)}</Text>
                  </View>
                )}
                {selectedOrder.deliveryPreferences.pickupDate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date de départ:</Text>
                    <Text style={styles.infoValue}>{formatDataValue(selectedOrder.deliveryPreferences.pickupDate)}</Text>
                  </View>
                )}
                {selectedOrder.deliveryPreferences.pickupTime && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Heure de départ:</Text>
                    <Text style={styles.infoValue}>{formatDataValue(selectedOrder.deliveryPreferences.pickupTime)}</Text>
                  </View>
                )}
                {selectedOrder.deliveryPreferences.dropDate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date de livraison:</Text>
                    <Text style={styles.infoValue}>{formatDataValue(selectedOrder.deliveryPreferences.dropDate)}</Text>
                  </View>
                )}
                {selectedOrder.deliveryPreferences.dropTime && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Heure de livraison:</Text>
                    <Text style={styles.infoValue}>{formatDataValue(selectedOrder.deliveryPreferences.dropTime)}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Méthode de contact:</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder.deliveryPreferences.contactMethod === 'phone' ? 'Téléphone' : 
                     selectedOrder.deliveryPreferences.contactMethod === 'email' ? 'Email' : 'Téléphone et Email'}
                  </Text>
                </View>
              </View>

              {/* Total */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Total</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Montant total:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(selectedOrder.total)}</Text>
                </View>
              </View>
            </ScrollView>
          )}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  itemsPreview: {
    marginTop: 8,
  },
  moreItemsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  packageInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  packageDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  packageDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  fragileText: {
    color: '#FF9800',
    fontWeight: '500',
  },
  urgentText: {
    color: '#E31837',
    fontWeight: '500',
  },
  multiplePackagesText: {
    fontSize: 12,
    color: '#E31837',
    fontWeight: '500',
    marginTop: 2,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
    maxWidth: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    maxWidth: '100%',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fragileBadge: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  urgentBadge: {
    backgroundColor: '#F8D7DA',
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  itemPackageDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  itemRecipientInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  itemSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    maxWidth: '100%',
  },
  itemDetailLabel: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  itemDetailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#E31837',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#E31837',
    fontWeight: 'bold',
  },
});
