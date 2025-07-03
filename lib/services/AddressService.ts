import { supabase } from '../supabase/config';

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  user_id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export interface UpdateAddressData {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

class AddressService {
  // Récupérer toutes les adresses d'un utilisateur
  async getUserAddresses(userId: string): Promise<{ addresses: UserAddress[]; error: any }> {
    try {
      const { data: addresses, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des adresses:', error);
        return { addresses: [], error };
      }

      return { addresses: addresses || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des adresses:', error);
      return { addresses: [], error };
    }
  }

  // Récupérer une adresse spécifique
  async getAddress(addressId: string): Promise<{ address: UserAddress | null; error: any }> {
    try {
      const { data: address, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('id', addressId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération de l\'adresse:', error);
        return { address: null, error };
      }

      return { address, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'adresse:', error);
      return { address: null, error };
    }
  }

  // Créer une nouvelle adresse
  async createAddress(addressData: CreateAddressData): Promise<{ addressId: string | null; error: any }> {
    try {
      console.log('📍 Création d\'adresse avec les données:', addressData);

      // Si c'est l'adresse par défaut, désactiver les autres
      if (addressData.is_default) {
        await this.removeDefaultFromOtherAddresses(addressData.user_id);
      }

      const { data: address, error } = await supabase
        .from('user_addresses')
        .insert([{
          user_id: addressData.user_id,
          label: addressData.label,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postal_code,
          country: addressData.country || 'Guinée',
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          is_default: addressData.is_default || false,
        }])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de l\'adresse:', error);
        return { addressId: null, error };
      }

      console.log('✅ Adresse créée avec succès:', address.id);
      return { addressId: address.id, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'adresse:', error);
      return { addressId: null, error };
    }
  }

  // Mettre à jour une adresse
  async updateAddress(addressId: string, updateData: UpdateAddressData): Promise<{ success: boolean; error: any }> {
    try {
      console.log('📍 Mise à jour de l\'adresse:', addressId, updateData);

      // Si c'est l'adresse par défaut, désactiver les autres
      if (updateData.is_default) {
        const { address } = await this.getAddress(addressId);
        if (address) {
          await this.removeDefaultFromOtherAddresses(address.user_id);
        }
      }

      const { error } = await supabase
        .from('user_addresses')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'adresse:', error);
        return { success: false, error };
      }

      console.log('✅ Adresse mise à jour avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'adresse:', error);
      return { success: false, error };
    }
  }

  // Supprimer une adresse
  async deleteAddress(addressId: string): Promise<{ success: boolean; error: any }> {
    try {
      console.log('📍 Suppression de l\'adresse:', addressId);

      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('❌ Erreur lors de la suppression de l\'adresse:', error);
        return { success: false, error };
      }

      console.log('✅ Adresse supprimée avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'adresse:', error);
      return { success: false, error };
    }
  }

  // Définir une adresse comme par défaut
  async setDefaultAddress(addressId: string): Promise<{ success: boolean; error: any }> {
    try {
      console.log('📍 Définition de l\'adresse par défaut:', addressId);

      // Récupérer l'utilisateur de cette adresse
      const { address } = await this.getAddress(addressId);
      if (!address) {
        return { success: false, error: 'Adresse non trouvée' };
      }

      // Désactiver les autres adresses par défaut
      await this.removeDefaultFromOtherAddresses(address.user_id);

      // Activer cette adresse comme par défaut
      const { error } = await supabase
        .from('user_addresses')
        .update({
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId);

      if (error) {
        console.error('❌ Erreur lors de la définition de l\'adresse par défaut:', error);
        return { success: false, error };
      }

      console.log('✅ Adresse définie comme par défaut avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la définition de l\'adresse par défaut:', error);
      return { success: false, error };
    }
  }

  // Récupérer l'adresse par défaut d'un utilisateur
  async getDefaultAddress(userId: string): Promise<{ address: UserAddress | null; error: any }> {
    try {
      const { data: address, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune adresse par défaut trouvée
          return { address: null, error: null };
        }
        console.error('❌ Erreur lors de la récupération de l\'adresse par défaut:', error);
        return { address: null, error };
      }

      return { address, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'adresse par défaut:', error);
      return { address: null, error };
    }
  }

  // Méthode privée pour désactiver les autres adresses par défaut
  private async removeDefaultFromOtherAddresses(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_addresses')
        .update({
          is_default: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_default', true);
    } catch (error) {
      console.error('❌ Erreur lors de la désactivation des autres adresses par défaut:', error);
    }
  }
}

export const addressService = new AddressService(); 