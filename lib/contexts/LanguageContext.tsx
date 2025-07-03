import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'fr' | 'en' | 'ar';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations = {
  fr: {
    // Profile
    'profile.title': 'Mon Compte',
    'profile.edit': 'Modifier le profil',
    'profile.language': 'Langue',
    'profile.chat': 'Discuter avec nous',
    'profile.payment': 'Méthodes de paiement',
    'profile.map': 'Application de carte par défaut',
    'profile.subscription': 'Paramètres d\'abonnement',
    'profile.terms': 'Conditions et services',
    'profile.privacy': 'Politique de confidentialité',
    'profile.signout': 'Se déconnecter',
    'profile.signout.confirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
    'profile.signout.cancel': 'Annuler',
    'profile.signout.confirm': 'Déconnecter',
    
    // Language
    'language.french': 'Français',
    'language.english': 'Anglais',
    'language.arabic': 'العربية',
    'language.select': 'Sélectionner la langue',
    'language.save': 'Enregistrer',
    
    // Edit Profile
    'edit.title': 'Modifier le profil',
    'edit.name': 'Nom complet',
    'edit.phone': 'Numéro de téléphone',
    'edit.email': 'Adresse e-mail',
    'edit.email.disabled': 'L\'adresse e-mail ne peut pas être modifiée',
    'edit.save': 'Enregistrer',
    'edit.delete': 'Supprimer le compte',
    'edit.delete.confirm': 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
    'edit.delete.cancel': 'Annuler',
    'edit.delete.confirm': 'Supprimer',
    'edit.loading': 'Chargement du profil...',
    'edit.success': 'Profil mis à jour avec succès !',
    'edit.error.name': 'Le nom est obligatoire.',
    'edit.error.general': 'Une erreur inattendue s\'est produite.',
    'edit.error.update': 'Erreur lors de la mise à jour du profil.',
    'edit.disclaimer': 'Les communications et l\'historique des transactions de BraPrime seront envoyés à l\'adresse e-mail vérifiée',
    
    // Map Settings
    'map.title': 'Application de carte par défaut',
    'map.subtitle': 'Sera ouverte pour afficher l\'adresse de la commande',
    'map.google': 'Google Maps',
    'map.apple': 'Apple Maps',
    
    // Payment
    'payment.title': 'Ajouter une nouvelle carte',
    'payment.cardNumber': 'Numéro de carte',
    'payment.expiry': 'Date d\'expiration',
    'payment.cvv': 'CVV',
    'payment.holder': 'Nom du titulaire',
    'payment.save': 'Enregistrer la carte',
    
    // Common
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.confirm': 'Confirmer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.back': 'Retour',
  },
  en: {
    // Profile
    'profile.title': 'My Account',
    'profile.edit': 'Edit Profile',
    'profile.language': 'Language',
    'profile.chat': 'Chat with us',
    'profile.payment': 'Payment Methods',
    'profile.map': 'Default Map Application',
    'profile.subscription': 'Subscription Settings',
    'profile.terms': 'Terms & Services',
    'profile.privacy': 'Privacy Policy',
    'profile.signout': 'Sign Out',
    'profile.signout.confirm': 'Are you sure you want to sign out?',
    'profile.signout.cancel': 'Cancel',
    'profile.signout.confirm': 'Sign Out',
    
    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.select': 'Select Language',
    'language.save': 'Save',
    
    // Edit Profile
    'edit.title': 'Edit Profile',
    'edit.name': 'Full Name',
    'edit.phone': 'Phone Number',
    'edit.email': 'Email Address',
    'edit.email.disabled': 'Email address cannot be modified',
    'edit.save': 'Save',
    'edit.delete': 'Delete Account',
    'edit.delete.confirm': 'Are you sure you want to delete your account? This action is irreversible.',
    'edit.delete.cancel': 'Cancel',
    'edit.delete.confirm': 'Delete',
    'edit.loading': 'Loading profile...',
    'edit.success': 'Profile updated successfully!',
    'edit.error.name': 'Name is required.',
    'edit.error.general': 'An unexpected error occurred.',
    'edit.error.update': 'Error updating profile.',
    'edit.disclaimer': 'BraPrime communications and transaction history will be sent to the verified email address',
    
    // Map Settings
    'map.title': 'Default Map Application',
    'map.subtitle': 'Will be opened to display the order address',
    'map.google': 'Google Maps',
    'map.apple': 'Apple Maps',
    
    // Payment
    'payment.title': 'Add New Card',
    'payment.cardNumber': 'Card Number',
    'payment.expiry': 'Expiry Date',
    'payment.cvv': 'CVV',
    'payment.holder': 'Cardholder Name',
    'payment.save': 'Save Card',
    
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
  },
  ar: {
    // Profile
    'profile.title': 'حسابي',
    'profile.edit': 'تعديل الملف الشخصي',
    'profile.language': 'اللغة',
    'profile.chat': 'تحدث معنا',
    'profile.payment': 'طرق الدفع',
    'profile.map': 'تطبيق الخريطة الافتراضي',
    'profile.subscription': 'إعدادات الاشتراك',
    'profile.terms': 'الشروط والخدمات',
    'profile.privacy': 'سياسة الخصوصية',
    'profile.signout': 'تسجيل الخروج',
    'profile.signout.confirm': 'هل أنت متأكد من أنك تريد تسجيل الخروج؟',
    'profile.signout.cancel': 'إلغاء',
    'profile.signout.confirm': 'تسجيل الخروج',
    
    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.select': 'اختر اللغة',
    'language.save': 'حفظ',
    
    // Edit Profile
    'edit.title': 'تعديل الملف الشخصي',
    'edit.name': 'الاسم الكامل',
    'edit.phone': 'رقم الهاتف',
    'edit.email': 'عنوان البريد الإلكتروني',
    'edit.email.disabled': 'لا يمكن تعديل عنوان البريد الإلكتروني',
    'edit.save': 'حفظ',
    'edit.delete': 'حذف الحساب',
    'edit.delete.confirm': 'هل أنت متأكد من أنك تريد حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.',
    'edit.delete.cancel': 'إلغاء',
    'edit.delete.confirm': 'حذف',
    'edit.loading': 'جاري تحميل الملف الشخصي...',
    'edit.success': 'تم تحديث الملف الشخصي بنجاح!',
    'edit.error.name': 'الاسم مطلوب.',
    'edit.error.general': 'حدث خطأ غير متوقع.',
    'edit.error.update': 'خطأ في تحديث الملف الشخصي.',
    'edit.disclaimer': 'سيتم إرسال اتصالات BraPrime وسجل المعاملات إلى عنوان البريد الإلكتروني المؤكد',
    
    // Map Settings
    'map.title': 'تطبيق الخريطة الافتراضي',
    'map.subtitle': 'سيتم فتحه لعرض عنوان الطلب',
    'map.google': 'خرائط جوجل',
    'map.apple': 'خرائط آبل',
    
    // Payment
    'payment.title': 'إضافة بطاقة جديدة',
    'payment.cardNumber': 'رقم البطاقة',
    'payment.expiry': 'تاريخ انتهاء الصلاحية',
    'payment.cvv': 'CVV',
    'payment.holder': 'اسم حامل البطاقة',
    'payment.save': 'حفظ البطاقة',
    
    // Common
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.confirm': 'تأكيد',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.back': 'رجوع',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    // Charger la langue sauvegardée
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@language');
      if (savedLanguage && ['fr', 'en', 'ar'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('@language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 