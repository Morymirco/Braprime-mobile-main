import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { supabase } from '../lib/supabase/config';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Créer un profil manquant
  const createProfile = async (userId: string) => {
    try {
      console.log('🔧 Création du profil manquant pour:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user?.email || null,
          phone: user?.phone || null,
          full_name: user?.user_metadata?.full_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création profil:', error);
        throw error;
      }

      console.log('✅ Profil créé avec succès:', data);
      return data;
    } catch (err) {
      console.error('❌ Erreur lors de la création du profil:', err);
      throw err;
    }
  };

  // Récupérer le profil utilisateur
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Si le profil n'existe pas, le créer
        if (error.code === 'PGRST116') {
          console.log('⚠️  Profil non trouvé, création en cours...');
          const newProfile = await createProfile(user.id);
          setProfile(newProfile);
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du profil';
      setError(errorMessage);
      console.error('Erreur fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil utilisateur
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      console.error('Erreur updateProfile:', err);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour l'avatar
  const updateAvatar = async (avatarUrl: string) => {
    return updateProfile({ avatar_url: avatarUrl });
  };

  // Effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  // Charger le profil au montage et quand l'utilisateur change
  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    clearError,
  };
} 