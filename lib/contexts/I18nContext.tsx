import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'fr' | 'en' | 'ar';

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: any) => string;
  isRTL: boolean;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    // Initialiser i18n et charger la langue sauvegardée
    initializeI18n();
  }, []);

  const initializeI18n = async () => {
    try {
      setIsLoading(true);
      
      // Charger la langue sauvegardée
      const savedLanguage = await AsyncStorage.getItem('@language');
      if (savedLanguage && ['fr', 'en', 'ar'].includes(savedLanguage)) {
        await i18n.changeLanguage(savedLanguage);
        setLanguageState(savedLanguage as Language);
        console.log('🌍 Langue chargée:', savedLanguage);
      } else {
        // Langue par défaut
        await i18n.changeLanguage('fr');
        setLanguageState('fr');
        console.log('🌍 Langue par défaut: fr');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation i18n:', error);
      // Fallback vers français
      await i18n.changeLanguage('fr');
      setLanguageState('fr');
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      // Sauvegarder la langue
      await AsyncStorage.setItem('@language', lang);
      
      // Changer la langue dans i18n
      await i18n.changeLanguage(lang);
      setLanguageState(lang);
      
      console.log('🌍 Langue changée vers:', lang);
    } catch (error) {
      console.error('❌ Erreur lors du changement de langue:', error);
    }
  };

  const isRTL = language === 'ar';

  return (
    <I18nContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isRTL,
      isLoading
    }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
