import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import des fichiers de traduction
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Récupérer la langue sauvegardée
      const savedLanguage = await AsyncStorage.getItem('@language');
      if (savedLanguage && ['fr', 'en', 'ar'].includes(savedLanguage)) {
        callback(savedLanguage);
        return;
      }
      // Langue par défaut
      callback('fr');
    } catch (error) {
      console.error('Erreur lors de la détection de langue:', error);
      callback('fr');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('@language', lng);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de langue:', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'fr',
    debug: __DEV__,
    
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },
    
    react: {
      useSuspense: false, // Éviter les problèmes avec React Native
    },
  });

export default i18n;
