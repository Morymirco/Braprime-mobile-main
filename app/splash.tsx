import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { SessionService } from '../lib/services/SessionService';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const { setLanguage } = useLanguage();
  
  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('🔄 Vérification de l\'authentification dans le splash...');
      
      const session = await SessionService.getSession();
      
      if (session && session.user) {
        console.log('✅ Session trouvée, redirection vers l\'app principale');
        router.replace('/(tabs)');
        return;
      }
      
      console.log('❌ Aucune session, redirection vers la connexion');
      // Attendre un peu avant de rediriger
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error);
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
        <Text style={styles.title}>Select Your Language</Text>
        
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={async () => {
            await setLanguage('en');
            router.replace('/login');
          }}
        >
          <Text style={styles.languageText}>English</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.languageButton, styles.lastLanguageButton]}
          onPress={async () => {
            await setLanguage('fr');
            router.replace('/login');
          }}
        >
          <Text style={styles.languageText}>Français</Text>
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