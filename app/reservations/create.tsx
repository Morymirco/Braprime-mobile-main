import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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
import { BusinessService, BusinessWithType } from '../../lib/services/BusinessService';
import { BusinessType, BusinessTypeService } from '../../lib/services/BusinessTypeService';

export default function CreateReservationScreen() {
  const router = useRouter();
  const { createReservation } = useReservations();

  const [businesses, setBusinesses] = useState<BusinessWithType[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithType | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [isLoadingBusinessTypes, setIsLoadingBusinessTypes] = useState(true);

  // Charger les restaurants et types au montage du composant
  useEffect(() => {
    loadBusinesses();
    loadBusinessTypes();
  }, []);

  const loadBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      const data = await BusinessService.getAllBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des restaurants');
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  const loadBusinessTypes = async () => {
    try {
      setIsLoadingBusinessTypes(true);
      const data = await BusinessTypeService.getAllBusinessTypes();
      setBusinessTypes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des types de restaurant:', error);
    } finally {
      setIsLoadingBusinessTypes(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectBusiness = (business: BusinessWithType) => {
    setSelectedBusiness(business);
    setShowBusinessSelector(false);
  };

  const handleSelectBusinessType = (businessType: BusinessType | null) => {
    setSelectedBusinessType(businessType);
  };

  // Filtrer les restaurants par type sélectionné
  const filteredBusinesses = selectedBusinessType 
    ? businesses.filter(business => business.business_type_id === selectedBusinessType.id)
    : businesses;

  const handleSubmit = async () => {
    if (!selectedBusiness) {
      Alert.alert('Erreur', 'Veuillez sélectionner un restaurant');
      return;
    }

    if (!date.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une date');
      return;
    }

    if (!time.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une heure');
      return;
    }

    if (parseInt(partySize) < 1) {
      Alert.alert('Erreur', 'Le nombre de personnes doit être au moins 1');
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationData = {
        business_id: selectedBusiness.id,
        business_name: selectedBusiness.name,
        date: date,
        time: time,
        guests: parseInt(partySize),
        special_requests: specialRequests.trim() || undefined
      };

      const result = await createReservation(reservationData);

      if (result.success) {
        // Rediriger vers la page de succès avec les données de la réservation
        router.push({
          pathname: '/reservations/success',
          params: {
            business_name: selectedBusiness.name,
            business_image: selectedBusiness.cover_image || selectedBusiness.logo,
            date: date,
            time: time,
            guests: partySize,
            reservation_id: result.reservation?.id || 'N/A'
          }
        });
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la création de la réservation');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la création de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBusinessTypeItem = ({ item }: { item: BusinessType }) => (
    <TouchableOpacity 
      style={[
        styles.businessTypeItem,
        selectedBusinessType?.id === item.id && styles.businessTypeItemSelected
      ]}
      onPress={() => handleSelectBusinessType(selectedBusinessType?.id === item.id ? null : item)}
    >
      <Text style={[
        styles.businessTypeText,
        selectedBusinessType?.id === item.id && styles.businessTypeTextSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderBusinessItem = ({ item }: { item: BusinessWithType }) => (
    <TouchableOpacity 
      style={styles.businessItem}
      onPress={() => handleSelectBusiness(item)}
    >
      {item.cover_image && (
        <Image
          source={{ uri: item.cover_image }}
          style={styles.businessItemImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.businessItemInfo}>
        <Text style={styles.businessItemName}>{item.name}</Text>
        <Text style={styles.businessItemType}>{item.business_type?.name}</Text>
        <Text style={styles.businessItemAddress}>{item.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle Réservation</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <TouchableOpacity 
            style={styles.businessSelector}
            onPress={() => setShowBusinessSelector(true)}
          >
            {selectedBusiness ? (
              <View style={styles.selectedBusiness}>
                {selectedBusiness.cover_image && (
                  <Image
                    source={{ uri: selectedBusiness.cover_image }}
                    style={styles.selectedBusinessImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.selectedBusinessInfo}>
                  <Text style={styles.selectedBusinessName}>{selectedBusiness.name}</Text>
                  <Text style={styles.selectedBusinessType}>{selectedBusiness.business_type?.name}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderBusiness}>
                <Ionicons name="restaurant-outline" size={24} color="#666" />
                <Text style={styles.placeholderText}>Sélectionner un restaurant</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Date and Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Heure (HH:MM)"
            value={time}
            onChangeText={setTime}
            keyboardType="numeric"
          />
        </View>

        {/* Party Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nombre de personnes</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de personnes"
            value={partySize}
            onChangeText={setPartySize}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demandes spéciales (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Table près de la fenêtre, allergie aux fruits de mer..."
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Création en cours...' : 'Créer la réservation'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Business Selector Modal */}
      <Modal
        visible={showBusinessSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowBusinessSelector(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sélectionner un restaurant</Text>
          </View>

          {/* Business Type Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Type de restaurant</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.businessTypeList}
              contentContainerStyle={styles.businessTypeListContent}
            >
              <TouchableOpacity 
                style={[
                  styles.businessTypeItem,
                  !selectedBusinessType && styles.businessTypeItemSelected
                ]}
                onPress={() => handleSelectBusinessType(null)}
              >
                <Text style={[
                  styles.businessTypeText,
                  !selectedBusinessType && styles.businessTypeTextSelected
                ]}>
                  Tous
                </Text>
              </TouchableOpacity>
              {businessTypes.map((businessType) => (
                <TouchableOpacity 
                  key={businessType.id}
                  style={[
                    styles.businessTypeItem,
                    selectedBusinessType?.id === businessType.id && styles.businessTypeItemSelected
                  ]}
                  onPress={() => handleSelectBusinessType(selectedBusinessType?.id === businessType.id ? null : businessType)}
                >
                  <Text style={[
                    styles.businessTypeText,
                    selectedBusinessType?.id === businessType.id && styles.businessTypeTextSelected
                  ]}>
                    {businessType.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {isLoadingBusinesses ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement des restaurants...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredBusinesses}
              renderItem={renderBusinessItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.businessList}
              contentContainerStyle={styles.businessListContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="restaurant-outline" size={48} color="#999" />
                  <Text style={styles.emptyText}>
                    {selectedBusinessType 
                      ? `Aucun restaurant de type "${selectedBusinessType.name}" trouvé`
                      : 'Aucun restaurant trouvé'
                    }
                  </Text>
                </View>
              }
            />
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#E31837',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  businessSelector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedBusiness: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedBusinessImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  selectedBusinessInfo: {
    flex: 1,
  },
  selectedBusinessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  selectedBusinessType: {
    fontSize: 14,
    color: '#666',
  },
  placeholderBusiness: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  businessItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  businessItemInfo: {
    flex: 1,
  },
  businessItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  businessItemType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  businessItemAddress: {
    fontSize: 12,
    color: '#999',
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
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
  businessList: {
    flex: 1,
  },
  businessListContent: {
    padding: 0,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  businessTypeList: {
    flexDirection: 'row',
  },
  businessTypeListContent: {
    paddingHorizontal: 0,
  },
  businessTypeItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  businessTypeItemSelected: {
    backgroundColor: '#E31837',
    borderColor: '#E31837',
  },
  businessTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  businessTypeTextSelected: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
}); 