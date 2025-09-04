import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    ConakryCommune,
    ConakryQuartier,
    getCommunes,
    getQuartiersByCommune
} from '../lib/data/conakry-locations';

interface CommuneQuartierSelectorProps {
  selectedCommune: string;
  selectedQuartier: string;
  onCommuneChange: (communeId: string) => void;
  onQuartierChange: (quartierId: string) => void;
  required?: boolean;
}

export default function CommuneQuartierSelector({
  selectedCommune,
  selectedQuartier,
  onCommuneChange,
  onQuartierChange,
  required = false,
}: CommuneQuartierSelectorProps) {
  const [communes, setCommunes] = useState<ConakryCommune[]>([]);
  const [quartiers, setQuartiers] = useState<ConakryQuartier[]>([]);
  const [showCommuneModal, setShowCommuneModal] = useState(false);
  const [showQuartierModal, setShowQuartierModal] = useState(false);
  const [communeSearch, setCommuneSearch] = useState('');
  const [quartierSearch, setQuartierSearch] = useState('');

  // Charger les communes au montage
  useEffect(() => {
    const loadCommunes = () => {
      try {
        const communesData = getCommunes();
        setCommunes(communesData);
      } catch (error) {
        console.error('Erreur lors du chargement des communes:', error);
        Alert.alert('Erreur', 'Impossible de charger les communes de Conakry.');
      }
    };

    loadCommunes();
  }, []);

  // Charger les quartiers quand une commune est sélectionnée
  useEffect(() => {
    if (selectedCommune) {
      try {
        const communeId = parseInt(selectedCommune);
        const quartiersData = getQuartiersByCommune(communeId);
        setQuartiers(quartiersData);
      } catch (error) {
        console.error('Erreur lors du chargement des quartiers:', error);
        setQuartiers([]);
      }
    } else {
      setQuartiers([]);
    }
  }, [selectedCommune]);

  // Filtrer les communes selon la recherche
  const filteredCommunes = communes.filter(commune =>
    commune.name.toLowerCase().includes(communeSearch.toLowerCase())
  );

  // Filtrer les quartiers selon la recherche
  const filteredQuartiers = quartiers.filter(quartier =>
    quartier.name.toLowerCase().includes(quartierSearch.toLowerCase())
  );

  // Obtenir le nom de la commune sélectionnée
  const selectedCommuneName = communes.find(c => c.id.toString() === selectedCommune)?.name || '';
  
  // Obtenir le nom du quartier sélectionné
  const selectedQuartierName = quartiers.find(q => q.id.toString() === selectedQuartier)?.name || '';

  const handleCommuneSelect = (commune: ConakryCommune) => {
    onCommuneChange(commune.id.toString());
    onQuartierChange(''); // Réinitialiser le quartier
    setShowCommuneModal(false);
    setCommuneSearch('');
  };

  const handleQuartierSelect = (quartier: ConakryQuartier) => {
    onQuartierChange(quartier.id.toString());
    setShowQuartierModal(false);
    setQuartierSearch('');
  };

  const renderCommuneItem = ({ item }: { item: ConakryCommune }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedCommune === item.id.toString() && styles.selectedItem
      ]}
      onPress={() => handleCommuneSelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={[
          styles.itemTitle,
          selectedCommune === item.id.toString() && styles.selectedItemText
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.itemDescription,
          selectedCommune === item.id.toString() && styles.selectedItemDescription
        ]}>
          {item.description}
        </Text>
      </View>
      {selectedCommune === item.id.toString() && (
        <MaterialIcons name="check" size={24} color="#E31837" />
      )}
    </TouchableOpacity>
  );

  const renderQuartierItem = ({ item }: { item: ConakryQuartier }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedQuartier === item.id.toString() && styles.selectedItem
      ]}
      onPress={() => handleQuartierSelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={[
          styles.itemTitle,
          selectedQuartier === item.id.toString() && styles.selectedItemText
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.itemDescription,
          selectedQuartier === item.id.toString() && styles.selectedItemDescription
        ]}>
          {item.description}
        </Text>
      </View>
      {selectedQuartier === item.id.toString() && (
        <MaterialIcons name="check" size={24} color="#E31837" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sélection de la commune */}
      <View style={styles.selectorContainer}>
        <Text style={[styles.label, required && !selectedCommune && styles.requiredLabel]}>
          Commune de Conakry {required && '*'}
        </Text>
        <TouchableOpacity
          style={[
            styles.selector,
            !selectedCommune && required && styles.requiredSelector
          ]}
          onPress={() => setShowCommuneModal(true)}
        >
          <Text style={[
            styles.selectorText,
            !selectedCommune && styles.placeholderText
          ]}>
            {selectedCommuneName || 'Sélectionner une commune'}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
        </TouchableOpacity>
        {!selectedCommune && required && (
          <Text style={styles.errorText}>La sélection d'une commune est obligatoire</Text>
        )}
      </View>

      {/* Sélection du quartier */}
      <View style={styles.selectorContainer}>
        <Text style={[styles.label, required && !selectedQuartier && styles.requiredLabel]}>
          Quartier {required && '*'}
        </Text>
        <TouchableOpacity
          style={[
            styles.selector,
            !selectedQuartier && required && styles.requiredSelector,
            !selectedCommune && styles.disabledSelector
          ]}
          onPress={() => selectedCommune && setShowQuartierModal(true)}
          disabled={!selectedCommune}
        >
          <Text style={[
            styles.selectorText,
            !selectedQuartier && styles.placeholderText
          ]}>
            {!selectedCommune 
              ? "Sélectionnez d'abord une commune" 
              : selectedQuartierName || "Sélectionner un quartier"
            }
          </Text>
          <MaterialIcons 
            name="keyboard-arrow-down" 
            size={24} 
            color={!selectedCommune ? "#ccc" : "#666"} 
          />
        </TouchableOpacity>
        {!selectedQuartier && selectedCommune && required && (
          <Text style={styles.errorText}>La sélection d'un quartier est obligatoire</Text>
        )}
      </View>

      {/* Affichage de la sélection */}
      {(selectedCommune || selectedQuartier) && (
        <View style={styles.selectionDisplay}>
          <View style={styles.selectionItem}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.selectionText}>
              {selectedCommuneName && `Commune: ${selectedCommuneName}`}
              {selectedCommuneName && selectedQuartierName && ' • '}
              {selectedQuartierName && `Quartier: ${selectedQuartierName}`}
            </Text>
          </View>
        </View>
      )}

      {/* Modal de sélection des communes */}
      <Modal
        visible={showCommuneModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner une commune</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowCommuneModal(false);
                setCommuneSearch('');
              }}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une commune..."
              placeholderTextColor="#999"
              value={communeSearch}
              onChangeText={setCommuneSearch}
            />
          </View>

          <FlatList
            data={filteredCommunes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCommuneItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Modal de sélection des quartiers */}
      <Modal
        visible={showQuartierModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner un quartier</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowQuartierModal(false);
                setQuartierSearch('');
              }}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un quartier..."
              value={quartierSearch}
              onChangeText={setQuartierSearch}
            />
          </View>

          <FlatList
            data={filteredQuartiers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderQuartierItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selectorContainer: {
    marginBottom: 16,
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
  selector: {
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
  requiredSelector: {
    borderColor: '#FCA5A5',
  },
  disabledSelector: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
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
  selectionDisplay: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionText: {
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
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedItem: {
    backgroundColor: '#FEF2F2',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  selectedItemText: {
    color: '#E31837',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedItemDescription: {
    color: '#DC2626',
  },
});
