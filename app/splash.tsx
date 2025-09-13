import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../lib/contexts/I18nContext';
import { SessionService } from '../lib/services/SessionService';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const { setLanguage, t } = useI18n();
  
  useEffect(() => {
    // Vérifier seulement s'il y a une session existante
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      console.log('🔄 Vérification de la session existante...');
      
      const session = await SessionService.getSession();
      
      if (session && session.user) {
        console.log('✅ Session trouvée, redirection vers l\'app principale');
        router.replace('/(tabs)');
        return;
      }
      
      console.log('ℹ️ Aucune session, affichage de la sélection de langue');
      // Ne pas rediriger automatiquement, laisser l'utilisateur choisir sa langue
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      // En cas d'erreur, afficher quand même la sélection de langue
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>BraPrime</Text>
      </View>

      {/* Language Selection */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>{t('splash.selectLanguage')}</Text>
        
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={async () => {
            console.log('🌍 Langue sélectionnée: English');
            await setLanguage('en');
            router.replace('/login');
          }}
        >
          <Text style={styles.languageText}>{t('language.english')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.languageButton, styles.lastLanguageButton]}
          onPress={async () => {
            console.log('🌍 Langue sélectionnée: Français');
            await setLanguage('fr');
            router.replace('/login');
          }}
        >
          <Text style={styles.languageText}>{t('language.french')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E31837', // Red color
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 32,
    width: width,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
    fontFamily: 'System',
  },
  languageButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  lastLanguageButton: {
    borderBottomWidth: 0,
  },
  languageText: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'System',
  },
}); 