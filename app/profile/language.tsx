import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../../lib/contexts/I18nContext';

interface LanguageOption {
  code: 'fr' | 'en' | 'ar';
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦'
  }
];

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, t, isRTL } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'ar'>(language);

  const handleBack = () => {
    router.back();
  };

  const handleLanguageSelect = (lang: 'fr' | 'en' | 'ar') => {
    setSelectedLanguage(lang);
  };

  const handleSave = async () => {
    if (selectedLanguage !== language) {
      await setLanguage(selectedLanguage);
      Alert.alert(
        t('common.success'),
        'La langue a été changée avec succès.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Rediriger vers l'écran principal au lieu de revenir en arrière
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="black" />
        </TouchableOpacity>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{t('language.select')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('language.description')}
        </Text>

        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                selectedLanguage === lang.code && styles.languageItemSelected,
                { flexDirection: isRTL ? 'row-reverse' : 'row' }
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <View style={[styles.languageInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <View style={[styles.languageTexts, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.languageName, { textAlign: isRTL ? 'right' : 'left' }]}>{lang.nativeName}</Text>
                  <Text style={[styles.languageSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{lang.name}</Text>
                </View>
              </View>
              
              <View style={[
                styles.radioButton,
                selectedLanguage === lang.code && styles.radioButtonSelected
              ]}>
                {selectedLanguage === lang.code && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { textAlign: isRTL ? 'right' : 'left' }]}>{t('language.save')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  languageList: {
    marginBottom: 32,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  languageItemSelected: {
    borderColor: '#E41E31',
    backgroundColor: '#fff5f5',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageTexts: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#E41E31',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E41E31',
  },
  saveButton: {
    backgroundColor: '#E41E31',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E41E31',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 