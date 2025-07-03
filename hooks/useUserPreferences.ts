import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { supabase } from '../lib/supabase/config';

export interface UserPreferences {
  language: 'fr' | 'en' | 'ar';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareProfile: boolean;
    analytics: boolean;
  };
  mapProvider: 'google' | 'apple' | 'osm';
  currency: 'GNF' | 'USD' | 'EUR';
  timezone: string;
}

const defaultPreferences: UserPreferences = {
  language: 'fr',
  theme: 'light',
  notifications: {
    push: true,
    email: true,
    sms: false,
  },
  privacy: {
    shareLocation: true,
    shareProfile: true,
    analytics: true,
  },
  mapProvider: 'google',
  currency: 'GNF',
  timezone: 'Africa/Conakry',
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        // Si pas d'utilisateur, charger les préférences locales
        const localPrefs = await AsyncStorage.getItem('@user_preferences');
        if (localPrefs) {
          setPreferences({ ...defaultPreferences, ...JSON.parse(localPrefs) });
        } else {
          setPreferences(defaultPreferences);
        }
        setLoading(false);
        return;
      }

      // Charger depuis Supabase
      const { data: prefsData, error: prefsError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', `user_preferences_${user.id}`)
        .single();

      if (prefsError && prefsError.code !== 'PGRST116') {
        console.error('❌ Erreur lors du chargement des préférences:', prefsError);
        setError(prefsError.message);
      }

      if (prefsData) {
        const userPrefs = { ...defaultPreferences, ...prefsData.value };
        setPreferences(userPrefs);
        
        // Sauvegarder aussi localement
        await AsyncStorage.setItem('@user_preferences', JSON.stringify(userPrefs));
      } else {
        // Utiliser les préférences par défaut
        setPreferences(defaultPreferences);
        await AsyncStorage.setItem('@user_preferences', JSON.stringify(defaultPreferences));
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des préférences:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      setError(null);

      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      // Sauvegarder localement
      await AsyncStorage.setItem('@user_preferences', JSON.stringify(newPreferences));

      if (user) {
        // Sauvegarder sur Supabase
        const { error: updateError } = await supabase
          .from('app_settings')
          .upsert({
            key: `user_preferences_${user.id}`,
            value: newPreferences,
            description: 'Préférences utilisateur'
          });

        if (updateError) {
          console.error('❌ Erreur lors de la sauvegarde des préférences:', updateError);
          setError(updateError.message);
        }
      }

      console.log('✅ Préférences mises à jour:', newPreferences);
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour des préférences:', err);
      setError('Erreur de connexion');
    }
  };

  const resetPreferences = async () => {
    try {
      setPreferences(defaultPreferences);
      await AsyncStorage.setItem('@user_preferences', JSON.stringify(defaultPreferences));

      if (user) {
        const { error } = await supabase
          .from('app_settings')
          .delete()
          .eq('key', `user_preferences_${user.id}`);

        if (error) {
          console.error('❌ Erreur lors de la réinitialisation des préférences:', error);
        }
      }
    } catch (err) {
      console.error('❌ Erreur lors de la réinitialisation des préférences:', err);
    }
  };

  // Charger les préférences au montage
  useEffect(() => {
    loadPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    refetch: loadPreferences,
  };
}; 