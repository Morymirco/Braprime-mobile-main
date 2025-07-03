import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
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
import { useReservations } from '../../hooks/useReservations';
import { Reservation } from '../../lib/services/ReservationService';

const { width } = Dimensions.get('window');

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

// Helper function to get status badge color
const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case 'pending': return '#fff3cd';
    case 'confirmed': return '#d1ecf1';
    case 'cancelled': return '#f8d7da';
    case 'no_show': return '#f8d7da';
    case 'completed': return '#d4edda';
    default: return '#f3f4f6';
  }
};

const getStatusTextColor = (status: ReservationStatus) => {
  switch (status) {
    case 'pending': return '#856404';
    case 'confirmed': return '#0c5460';
    case 'cancelled': return '#721c24';
    case 'no_show': return '#721c24';
    case 'completed': return '#155724';
    default: return '#6b7280';
  }
};

// Helper function to get status icon
const StatusIcon = ({ status, size = 16 }: { status: ReservationStatus; size?: number }) => {
  switch (status) {
    case 'pending': return <Ionicons name="time-outline" size={size} color={getStatusTextColor(status)} />;
    case 'confirmed': return <Ionicons name="checkmark-circle-outline" size={size} color={getStatusTextColor(status)} />;
    case 'cancelled': return <Ionicons name="close-circle" size={size} color={getStatusTextColor(status)} />;
    case 'no_show': return <Ionicons name="close-circle" size={size} color={getStatusTextColor(status)} />;
    case 'completed': return <Ionicons name="checkmark-circle" size={size} color={getStatusTextColor(status)} />;
    default: return <Ionicons name="time-outline" size={size} color={getStatusTextColor(status)} />;
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to format time
const formatTime = (timeString: string) => {
  return timeString;
};

export default function ReservationsScreen() {
  const router = useRouter();
  const { reservations, isLoading, error, cancelReservation } = useReservations();

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter reservations based on selected filter and search term
  const filteredReservations = reservations.filter((reservation) => {
    const matchesFilter = filter === 'all' || reservation.status === filter;
    const matchesSearch = 
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle view reservation details
  const handleViewReservationDetails = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowReservationDetails(true);
  }, []);

  // Handle cancel reservation
  const handleCancelReservation = useCallback(async (reservationId: string) => {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelReservation(reservationId);
            if (result.success) {
              setShowReservationDetails(false);
              setSelectedReservation(null);
              Alert.alert('Succès', 'Réservation annulée avec succès');
            } else {
              Alert.alert('Erreur', result.error || 'Erreur lors de l\'annulation');
            }
          },
        },
      ]
    );
  }, [cancelReservation]);

  const handleBack = () => {
    router.back();
  };

  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <TouchableOpacity 
      style={styles.reservationCard}
      onPress={() => handleViewReservationDetails(item)}
    >
      <View style={styles.reservationHeader}>
        <View style={styles.businessInfo}>
          {item.business_image && (
            <Image
              source={{ uri: item.business_image }}
              style={styles.businessImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{item.business_name}</Text>
            <Text style={styles.reservationDate}>
              {formatDate(item.date)} à {formatTime(item.time)}
            </Text>
            <Text style={styles.partySize}>
                              {item.guests} {item.guests === 1 ? 'personne' : 'personnes'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <StatusIcon status={item.status} />
          <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
            {item.status === 'pending' && 'En attente'}
            {item.status === 'confirmed' && 'Confirmée'}
            {item.status === 'cancelled' && 'Annulée'}
            {item.status === 'no_show' && 'Non-présent'}
            {item.status === 'completed' && 'Terminée'}
          </Text>
        </View>
      </View>

      <View style={styles.reservationActions}>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>Voir les détails</Text>
          <Feather name="chevron-right" size={16} color="#E31837" />
        </TouchableOpacity>
        
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelReservation(item.id)}
          >
            <MaterialIcons name="cancel" size={16} color="#E31837" />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-available" size={64} color="#999" />
      <Text style={styles.emptyTitle}>Aucune réservation trouvée</Text>
      <Text style={styles.emptyText}>
        {searchTerm || filter !== 'all' 
          ? 'Aucune réservation ne correspond à vos critères de recherche.'
          : "Vous n'avez pas encore fait de réservation."}
      </Text>
      <TouchableOpacity 
        style={styles.newReservationButton}
        onPress={() => router.push('/reservations/create')}
      >
        <Text style={styles.newReservationButtonText}>Faire une réservation</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Mes Réservations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des réservations...</Text>
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
          <Text style={styles.title}>Mes Réservations</Text>
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
        <Text style={styles.title}>Mes Réservations</Text>
      </View>

      <View style={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher des réservations..."
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
              style={[styles.filterButton, filter === 'confirmed' && styles.filterButtonActive]}
              onPress={() => setFilter('confirmed')}
            >
              <Text style={[styles.filterText, filter === 'confirmed' && styles.filterTextActive]}>
                Confirmées
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reservations List */}
        <FlatList
          data={filteredReservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          style={styles.reservationsList}
          contentContainerStyle={styles.reservationsListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/reservations/create')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Reservation Details Modal */}
      <Modal
        visible={showReservationDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedReservation && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowReservationDetails(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Détails de la réservation</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Reservation Status */}
              <View style={styles.modalSection}>
                <View style={styles.statusSection}>
                  <View style={styles.statusInfo}>
                    <StatusIcon status={selectedReservation.status} size={24} />
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReservation.status) }]}>
                      <Text style={[styles.statusText, { color: getStatusTextColor(selectedReservation.status) }]}>
                        {selectedReservation.status === 'pending' && 'En attente'}
                        {selectedReservation.status === 'confirmed' && 'Confirmée'}
                        {selectedReservation.status === 'cancelled' && 'Annulée'}
                        {selectedReservation.status === 'no_show' && 'Non-présent'}
                        {selectedReservation.status === 'completed' && 'Terminée'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Business Information */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Restaurant</Text>
                <View style={styles.businessCard}>
                  {selectedReservation.business_image && (
                    <Image
                      source={{ uri: selectedReservation.business_image }}
                      style={styles.businessDetailImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.businessDetailInfo}>
                    <Text style={styles.businessDetailName}>{selectedReservation.business_name}</Text>
                  </View>
                </View>
              </View>

              {/* Reservation Details */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Détails de la réservation</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(selectedReservation.date)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Heure:</Text>
                    <Text style={styles.infoValue}>{formatTime(selectedReservation.time)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nombre de personnes:</Text>
                    <Text style={styles.infoValue}>
                      {selectedReservation.guests} {selectedReservation.guests === 1 ? 'personne' : 'personnes'}
                    </Text>
                  </View>
                  {selectedReservation.special_requests && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Demandes spéciales:</Text>
                      <Text style={styles.infoValue}>{selectedReservation.special_requests}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              {selectedReservation.status === 'pending' && (
                <View style={styles.modalSection}>
                  <TouchableOpacity 
                    style={styles.cancelReservationButton}
                    onPress={() => handleCancelReservation(selectedReservation.id)}
                  >
                    <Text style={styles.cancelReservationButtonText}>Annuler la réservation</Text>
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
  reservationsList: {
    flex: 1,
  },
  reservationsListContent: {
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
    marginBottom: 24,
  },
  newReservationButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newReservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reservationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reservationDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  partySize: {
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
  reservationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#E31837',
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
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  businessDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  businessDetailInfo: {
    flex: 1,
  },
  businessDetailName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  cancelReservationButton: {
    backgroundColor: '#E31837',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelReservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#E31837',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}); 