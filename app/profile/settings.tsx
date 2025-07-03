import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useLanguage } from '../../lib/contexts/LanguageContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  
  const [notifications, setNotifications] = useState(preferences.notifications);
  const [privacy, setPrivacy] = useState(preferences.privacy);

  const handleBack = () => {
    router.back();
  };

  const handleNotificationToggle = async (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    await updatePreferences({ notifications: newNotifications });
  };

  const handlePrivacyToggle = async (key: keyof typeof privacy, value: boolean) => {
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);
    await updatePreferences({ privacy: newPrivacy });
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    await updatePreferences({ theme });
    Alert.alert(
      'Thème changé',
      'Le thème a été mis à jour. L\'application va se redémarrer.',
      [{ text: 'OK' }]
    );
  };

  const handleCurrencyChange = async (currency: 'GNF' | 'USD' | 'EUR') => {
    await updatePreferences({ currency });
    Alert.alert(
      'Devise changée',
      'La devise a été mise à jour.',
      [{ text: 'OK' }]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Réinitialiser les paramètres',
      'Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: () => {
          // Ici vous pourriez implémenter la réinitialisation
          Alert.alert('Fonctionnalité à venir', 'La réinitialisation sera bientôt disponible.');
        }},
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des paramètres...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Notifications push</Text>
                <Text style={styles.settingSubtext}>Recevoir des notifications sur votre appareil</Text>
              </View>
            </View>
            <Switch
              value={notifications.push}
              onValueChange={(value) => handleNotificationToggle('push', value)}
              trackColor={{ false: '#e0e0e0', true: '#E41E31' }}
              thumbColor={notifications.push ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Notifications par email</Text>
                <Text style={styles.settingSubtext}>Recevoir des notifications par email</Text>
              </View>
            </View>
            <Switch
              value={notifications.email}
              onValueChange={(value) => handleNotificationToggle('email', value)}
              trackColor={{ false: '#e0e0e0', true: '#E41E31' }}
              thumbColor={notifications.email ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Notifications SMS</Text>
                <Text style={styles.settingSubtext}>Recevoir des notifications par SMS</Text>
              </View>
            </View>
            <Switch
              value={notifications.sms}
              onValueChange={(value) => handleNotificationToggle('sms', value)}
              trackColor={{ false: '#e0e0e0', true: '#E41E31' }}
              thumbColor={notifications.sms ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Partager ma localisation</Text>
                <Text style={styles.settingSubtext}>Autoriser l'accès à votre position</Text>
              </View>
            </View>
            <Switch
              value={privacy.shareLocation}
              onValueChange={(value) => handlePrivacyToggle('shareLocation', value)}
              trackColor={{ false: '#e0e0e0', true: '#E41E31' }}
              thumbColor={privacy.shareLocation ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Profil public</Text>
                <Text style={styles.settingSubtext}>Rendre votre profil visible aux autres</Text>
              </View>
            </View>
            <Switch
              value={privacy.shareProfile}
              onValueChange={(value) => handlePrivacyToggle('shareProfile', value)}
              trackColor={{ false: '#e0e0e0', true: '#E41E31' }}
              thumbColor={privacy.shareProfile ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="analytics-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Analytics</Text>
                <Text style={styles.settingSubtext}>Partager les données d'utilisation</Text>
              </View>
            </View>
            <Switch
              value={privacy.analytics}
              onValueChange={(value) => handlePrivacyToggle('analytics', value)}
              trackColor={{ false: '#e0e0e0', true: '#E41E31' }}
              thumbColor={privacy.analytics ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              const themes = ['light', 'dark', 'auto'];
              const currentIndex = themes.indexOf(preferences.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length] as 'light' | 'dark' | 'auto';
              handleThemeChange(nextTheme);
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Thème</Text>
                <Text style={styles.settingSubtext}>
                  {preferences.theme === 'light' ? 'Clair' : 
                   preferences.theme === 'dark' ? 'Sombre' : 'Automatique'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Regional Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Régional</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              const currencies = ['GNF', 'USD', 'EUR'];
              const currentIndex = currencies.indexOf(preferences.currency);
              const nextCurrency = currencies[(currentIndex + 1) % currencies.length] as 'GNF' | 'USD' | 'EUR';
              handleCurrencyChange(nextCurrency);
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={24} color="black" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingText}>Devise</Text>
                <Text style={styles.settingSubtext}>
                  {preferences.currency === 'GNF' ? 'Franc guinéen' : 
                   preferences.currency === 'USD' ? 'Dollar américain' : 'Euro'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Reset Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetSettings}
          >
            <Ionicons name="refresh-outline" size={24} color="#dc3545" />
            <Text style={styles.resetButtonText}>Réinitialiser tous les paramètres</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTexts: {
    marginLeft: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  resetButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 