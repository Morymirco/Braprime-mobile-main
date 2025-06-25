import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { supabase } from '../lib/supabase/config';

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
  role_name?: string;
  role_description?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      console.log('🔍 Récupération du profil pour l\'utilisateur:', user.id);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError);
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setError('Profil utilisateur non trouvé');
        setLoading(false);
        return;
      }

      const transformedProfile: UserProfile = {
        ...profileData,
        role_name: profileData.role_id === 2 ? 'partner' : 'customer',
        role_description: profileData.role_id === 2 ? 'Partenaire commercial' : 'Client'
      };

      console.log('✅ Profil récupéré avec succès:', transformedProfile);
      setProfile(transformedProfile);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération du profil:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('Utilisateur non authentifié');
        return;
      }

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        setError(error.message);
        return;
      }

      const transformedProfile: UserProfile = {
        ...updatedProfile,
        role_name: updatedProfile.role_id === 2 ? 'partner' : 'customer',
        role_description: updatedProfile.role_id === 2 ? 'Partenaire commercial' : 'Client'
      };

      setProfile(transformedProfile);
      console.log('✅ Profil mis à jour avec succès:', transformedProfile);
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du profil:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le profil au montage du composant
  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile
  };
}; 