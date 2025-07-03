import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { addressService, CreateAddressData, UpdateAddressData, UserAddress } from '../lib/services/AddressService';
import { useToast } from './useToast';

export const useAddresses = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les adresses
  const loadAddresses = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { addresses: userAddresses, error: addressesError } = await addressService.getUserAddresses(user.id);
      
      if (addressesError) {
        setError('Erreur lors du chargement des adresses');
        showToast('Erreur lors du chargement des adresses', 'error');
        return;
      }

      setAddresses(userAddresses);

      // Trouver l'adresse par défaut
      const defaultAddr = userAddresses.find(addr => addr.is_default);
      setDefaultAddress(defaultAddr || null);

    } catch (err) {
      setError('Erreur lors du chargement des adresses');
      showToast('Erreur lors du chargement des adresses', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  // Créer une nouvelle adresse
  const createAddress = useCallback(async (addressData: Omit<CreateAddressData, 'user_id'>) => {
    if (!user?.id) {
      showToast('Utilisateur non connecté', 'error');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const { addressId, error: createError } = await addressService.createAddress({
        ...addressData,
        user_id: user.id
      });

      if (createError) {
        setError('Erreur lors de la création de l\'adresse');
        showToast('Erreur lors de la création de l\'adresse', 'error');
        return { success: false };
      }

      showToast('Adresse créée avec succès', 'success');
      await loadAddresses(); // Recharger les adresses
      return { success: true, addressId };

    } catch (err) {
      setError('Erreur lors de la création de l\'adresse');
      showToast('Erreur lors de la création de l\'adresse', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadAddresses, showToast]);

  // Mettre à jour une adresse
  const updateAddress = useCallback(async (addressId: string, updateData: UpdateAddressData) => {
    setLoading(true);
    setError(null);

    try {
      const { success, error: updateError } = await addressService.updateAddress(addressId, updateData);

      if (updateError || !success) {
        setError('Erreur lors de la mise à jour de l\'adresse');
        showToast('Erreur lors de la mise à jour de l\'adresse', 'error');
        return { success: false };
      }

      showToast('Adresse mise à jour avec succès', 'success');
      await loadAddresses(); // Recharger les adresses
      return { success: true };

    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'adresse');
      showToast('Erreur lors de la mise à jour de l\'adresse', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [loadAddresses, showToast]);

  // Supprimer une adresse
  const deleteAddress = useCallback(async (addressId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { success, error: deleteError } = await addressService.deleteAddress(addressId);

      if (deleteError || !success) {
        setError('Erreur lors de la suppression de l\'adresse');
        showToast('Erreur lors de la suppression de l\'adresse', 'error');
        return { success: false };
      }

      showToast('Adresse supprimée avec succès', 'success');
      await loadAddresses(); // Recharger les adresses
      return { success: true };

    } catch (err) {
      setError('Erreur lors de la suppression de l\'adresse');
      showToast('Erreur lors de la suppression de l\'adresse', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [loadAddresses, showToast]);

  // Définir une adresse comme par défaut
  const setAddressAsDefault = useCallback(async (addressId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { success, error: defaultError } = await addressService.setDefaultAddress(addressId);

      if (defaultError || !success) {
        setError('Erreur lors de la définition de l\'adresse par défaut');
        showToast('Erreur lors de la définition de l\'adresse par défaut', 'error');
        return { success: false };
      }

      showToast('Adresse définie comme par défaut', 'success');
      await loadAddresses(); // Recharger les adresses
      return { success: true };

    } catch (err) {
      setError('Erreur lors de la définition de l\'adresse par défaut');
      showToast('Erreur lors de la définition de l\'adresse par défaut', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [loadAddresses, showToast]);

  // Charger les adresses au montage du composant
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setAddressAsDefault,
    loadAddresses,
  };
}; 