import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { searchCommuneQuartierByAddress } from '../lib/data/conakry-locations';

interface SimpleAddressInputProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect?: (place: any) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showMap?: boolean;
}

export default function SimpleAddressInput({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Saisissez votre adresse complète...",
  label = "Adresse",
  required = false,
  showMap = true,
}: SimpleAddressInputProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Suggestions d'adresses prédéfinies pour Conakry
  const predefinedAddresses = [
    "Centre-ville, Kaloum, Conakry",
    "Almamya, Kaloum, Conakry",
    "Sandervalia, Kaloum, Conakry",
    "Boulbinet, Kaloum, Conakry",
    "Université Gamal Abdel Nasser, Dixinn, Conakry",
    "Lansanaya, Dixinn, Conakry",
    "Kipé, Dixinn, Conakry",
    "Bambeto, Dixinn, Conakry",
    "Ratoma Centre, Ratoma, Conakry",
    "Cosa, Ratoma, Conakry",
    "Koloma, Ratoma, Conakry",
    "Matam Centre, Matam, Conakry",
    "Matoto Centre, Matoto, Conakry",
    "Kagbelen Centre, Kagbelen, Conakry",
  ];

  // Filtrer les suggestions basées sur la recherche
  const filteredSuggestions = predefinedAddresses.filter(address =>
    address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gérer la sélection d'une suggestion
  const handleSuggestionSelect = (address: string) => {
    onChange(address);
    setSearchQuery(address);
    
    // Extraire les informations de localisation
    const locationInfo = searchCommuneQuartierByAddress(address);
    
    console.log('📍 Informations de localisation extraites:', {
      locationInfo,
      fullAddress: address
    });
    
    // Appeler le callback si fourni
    if (onPlaceSelect) {
      onPlaceSelect({
        formatted_address: address,
        commune: locationInfo.commune,
        quartier: locationInfo.quartier
      });
    }
    
    setIsModalVisible(false);
  };

  // Ouvrir le modal de suggestions
  const openSuggestionsModal = () => {
    setIsModalVisible(true);
    setSearchQuery(value);
    setSuggestions(filteredSuggestions);
  };

  // Rendu d'une suggestion
  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <View style={styles.suggestionContent}>
        <MaterialIcons name="location-on" size={20} color="#E31837" />
        <Text style={styles.suggestionText}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, required && !value && styles.requiredLabel]}>
        {label} {required && '*'}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          !value && required && styles.requiredInput
        ]}
        onPress={openSuggestionsModal}
      >
        <View style={styles.inputContent}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <Text style={[
            styles.inputText,
            !value && styles.placeholderText
          ]}>
            {value || placeholder}
          </Text>
        </View>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
      </TouchableOpacity>
      
      {!value && required && (
        <Text style={styles.errorText}>Veuillez sélectionner une adresse valide</Text>
      )}
      
      {value && (
        <View style={styles.selectedAddressContainer}>
          <View style={styles.selectedAddressItem}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.selectedAddressText}>
              Adresse sélectionnée: {value}
            </Text>
          </View>
        </View>
      )}

      {/* Modal de suggestions */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner une adresse</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tapez votre adresse..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSuggestions(
                  predefinedAddresses.filter(address =>
                    address.toLowerCase().includes(text.toLowerCase())
                  )
                );
              }}
              autoFocus
            />
          </View>

          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={renderSuggestion}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              searchQuery.length >= 2 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="location-off" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    Aucune adresse trouvée pour "{searchQuery}"
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Vous pouvez saisir votre adresse manuellement
                  </Text>
                </View>
              ) : null
            }
          />

          {/* Bouton pour saisie manuelle */}
          <View style={styles.manualInputContainer}>
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={() => {
                onChange(searchQuery);
                setIsModalVisible(false);
              }}
            >
              <MaterialIcons name="edit" size={20} color="#E31837" />
              <Text style={styles.manualInputText}>
                Utiliser cette adresse: "{searchQuery}"
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  requiredLabel: {
    color: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  requiredInput: {
    borderColor: '#FCA5A5',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  selectedAddressContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  manualInputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  manualInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#E31837',
    borderRadius: 8,
    padding: 12,
  },
  manualInputText: {
    fontSize: 14,
    color: '#E31837',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});
