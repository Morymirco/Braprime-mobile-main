import { supabase } from '../supabase/config';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role_id: number;
  phone_number?: string;
  address?: string;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Propriétés calculées (sans jointure)
  role_name?: string;
  role_description?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone_number?: string;
  address?: string;
  profile_image?: string;
}

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

export const UserProfileService = {
  // Récupérer le profil de l'utilisateur connecté
  getCurrentUserProfile: async (): Promise<{ data: UserProfile | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return { data: null, error: error.message };
      }

      // Transformer les données pour inclure les informations du rôle (sans jointure)
      const transformedProfile = profile ? {
        ...profile,
        role_name: profile.role_id === 2 ? 'partner' : 'customer',
        role_description: profile.role_id === 2 ? 'Partenaire commercial' : 'Client'
      } : null;

      return { data: transformedProfile, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Mettre à jour le profil de l'utilisateur
  updateProfile: async (data: UpdateProfileData): Promise<{ data: UserProfile | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return { data: null, error: error.message };
      }

      // Transformer les données
      const transformedProfile = profile ? {
        ...profile,
        role_name: profile.role_id === 2 ? 'partner' : 'customer',
        role_description: profile.role_id === 2 ? 'Partenaire commercial' : 'Client'
      } : null;

      return { data: transformedProfile, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Uploader une image de profil
  uploadProfileImage: async (file: File): Promise<{ data: string | null; error: string | null }> => {
    try {
      console.log('🚀 Début de l\'upload de l\'image:', file.name, file.size, file.type);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ Utilisateur non authentifié');
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      console.log('✅ Utilisateur authentifié:', user.id);

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      console.log('📁 Chemin du fichier:', filePath);

      // Vérifier que le bucket existe
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('❌ Erreur lors de la vérification des buckets:', bucketError);
        return { data: null, error: 'Erreur de configuration du storage' };
      }

      const avatarsBucket = buckets?.find(b => b.id === 'avatars');
      if (!avatarsBucket) {
        console.error('❌ Bucket "avatars" non trouvé');
        console.log('📦 Buckets disponibles:', buckets?.map(b => b.id));
        return { data: null, error: 'Bucket de storage non configuré. Veuillez exécuter le script de configuration.' };
      }

      console.log('✅ Bucket "avatars" trouvé');

      // Uploader le fichier
      console.log('📤 Upload du fichier...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erreur lors de l\'upload de l\'image:', uploadError);
        return { data: null, error: uploadError.message };
      }

      console.log('✅ Fichier uploadé avec succès:', uploadData);

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('🔗 URL publique générée:', publicUrl);

      return { data: publicUrl, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image:', error);
      return { data: null, error: 'Erreur lors de l\'upload de l\'image' };
    }
  },

  // Supprimer une image de profil
  deleteProfileImage: async (imageUrl: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      // Extraire le chemin du fichier de l'URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `profile-images/${fileName}`;

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      return { success: false, error: 'Erreur lors de la suppression de l\'image' };
    }
  },

  // Récupérer les adresses de l'utilisateur
  getUserAddresses: async (): Promise<{ data: UserAddress[]; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: [], error: 'Utilisateur non authentifié' };
      }

      const { data: addresses, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des adresses:', error);
        return { data: [], error: error.message };
      }

      return { data: addresses || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des adresses:', error);
      return { data: [], error: 'Erreur de connexion' };
    }
  },

  // Créer une nouvelle adresse
  createAddress: async (data: CreateAddressData): Promise<{ data: UserAddress | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      // Si cette adresse est marquée comme défaut, désactiver les autres
      if (data.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data: address, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          ...data,
          country: data.country || 'Guinée'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'adresse:', error);
        return { data: null, error: error.message };
      }

      return { data: address, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de l\'adresse:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Mettre à jour une adresse
  updateAddress: async (addressId: string, data: Partial<CreateAddressData>): Promise<{ data: UserAddress | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      // Si cette adresse est marquée comme défaut, désactiver les autres
      if (data.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data: address, error } = await supabase
        .from('user_addresses')
        .update(data)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', error);
        return { data: null, error: error.message };
      }

      return { data: address, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'adresse:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Supprimer une adresse
  deleteAddress: async (addressId: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'adresse:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'adresse:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  // Définir une adresse comme défaut
  setDefaultAddress: async (addressId: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Désactiver toutes les adresses par défaut
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Activer l'adresse sélectionnée
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la définition de l\'adresse par défaut:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la définition de l\'adresse par défaut:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  // Changer le mot de passe
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      // D'abord, vérifier le mot de passe actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Vérifier le mot de passe actuel en essayant de se reconnecter
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword
      });

      if (signInError) {
        return { success: false, error: 'Le mot de passe actuel est incorrect' };
      }

      // Changer le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  // Supprimer le compte
  deleteAccount: async (): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Supprimer le profil utilisateur
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Erreur lors de la suppression du profil:', profileError);
        return { success: false, error: profileError.message };
      }

      // Supprimer l'utilisateur de l'auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }
}; 