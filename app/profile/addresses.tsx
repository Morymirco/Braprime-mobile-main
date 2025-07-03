import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AddressCard } from '../../components/AddressCard';
import { AddressForm } from '../../components/AddressForm';
import { Colors } from '../../constants/Colors';
import { useAddresses } from '../../hooks/useAddresses';
import { useColorScheme } from '../../hooks/useColorScheme';
import { UserAddress } from '../../lib/services/AddressService';

export default function AddressesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const {
    addresses,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setAddressAsDefault,
  } = useAddresses();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    await deleteAddress(addressId);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    await setAddressAsDefault(addressId);
  };

  const handleSubmitForm = async (data: any) => {
    if (editingAddress) {
      const result = await updateAddress(editingAddress.id, data);
      if (result.success) {
        setShowForm(false);
        setEditingAddress(null);
      }
    } else {
      const result = await createAddress(data);
      if (result.success) {
        setShowForm(false);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Mes adresses
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Contenu */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {loading && addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="reload" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Chargement des adresses...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={[styles.emptyStateText, { color: colors.error }]}>
              Erreur lors du chargement
            </Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              Aucune adresse
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Ajoutez votre première adresse pour faciliter vos commandes
            </Text>
          </View>
        ) : (
          <View style={styles.addressesList}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isDefault={address.is_default}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefaultAddress}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bouton d'ajout */}
      {addresses.length > 0 && (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddAddress}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>
              Ajouter une adresse
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal du formulaire */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddressForm
          address={editingAddress}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          loading={loading}
        />
      </Modal>

      {/* Bouton flottant pour ajouter (quand la liste est vide) */}
      {addresses.length === 0 && !loading && !error && (
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.primary }]}
          onPress={handleAddAddress}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addressesList: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 