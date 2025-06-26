import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
  };
  delivery: {
    defaultAddress?: string;
    preferredTime?: string;
    instructions?: string;
  };
  privacy: {
    shareLocation: boolean;
    shareProfile: boolean;
    analytics: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'fr',
  theme: 'auto',
  notifications: {
    push: true,
    email: true,
    sms: false,
  },
  location: {},
  delivery: {},
  privacy: {
    shareLocation: true,
    shareProfile: false,
    analytics: true,
  },
};

const PREFERENCES_KEY = '@braprime_user_preferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      setPreferences(updated);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      return false;
    }
  };

  const updateLanguage = async (language: string) => {
    return await savePreferences({ language });
  };

  const updateTheme = async (theme: 'light' | 'dark' | 'auto') => {
    return await savePreferences({ theme });
  };

  const updateNotifications = async (notifications: Partial<UserPreferences['notifications']>) => {
    return await savePreferences({
      notifications: { ...preferences.notifications, ...notifications }
    });
  };

  const updateLocation = async (location: Partial<UserPreferences['location']>) => {
    return await savePreferences({
      location: { ...preferences.location, ...location }
    });
  };

  const updateDelivery = async (delivery: Partial<UserPreferences['delivery']>) => {
    return await savePreferences({
      delivery: { ...preferences.delivery, ...delivery }
    });
  };

  const updatePrivacy = async (privacy: Partial<UserPreferences['privacy']>) => {
    return await savePreferences({
      privacy: { ...preferences.privacy, ...privacy }
    });
  };

  const resetPreferences = async () => {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
      setPreferences(DEFAULT_PREFERENCES);
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des préférences:', error);
      return false;
    }
  };

  return {
    preferences,
    loading,
    savePreferences,
    updateLanguage,
    updateTheme,
    updateNotifications,
    updateLocation,
    updateDelivery,
    updatePrivacy,
    resetPreferences,
  };
} 