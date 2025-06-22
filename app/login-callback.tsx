import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase/config';

export default function LoginCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔗 Traitement du callback d\'authentification...');
        
        // Récupérer les paramètres de l'URL
        const { access_token, refresh_token, error: authError } = params;
        
        if (authError) {
          console.error('❌ Erreur d\'authentification:', authError);
          setError('Erreur lors de la connexion. Veuillez réessayer.');
          setLoading(false);
          return;
        }

        if (access_token && refresh_token) {
          console.log('✅ Tokens reçus, connexion en cours...');
          
          // Échanger les tokens contre une session
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (error) {
            console.error('❌ Erreur lors de la création de la session:', error);
            setError('Erreur lors de la connexion. Veuillez réessayer.');
            setLoading(false);
            return;
          }

          if (data.session) {
            console.log('✅ Connexion réussie, redirection vers l\'application...');
            // Rediriger vers l'application principale
            router.replace('/(tabs)');
          } else {
            console.error('❌ Aucune session créée');
            setError('Erreur lors de la connexion. Veuillez réessayer.');
            setLoading(false);
          }
        } else {
          console.log('⚠️ Aucun token reçu, vérification de la session existante...');
          
          // Vérifier s'il y a déjà une session active
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('✅ Session existante trouvée, redirection...');
            router.replace('/(tabs)');
          } else {
            console.log('❌ Aucune session trouvée');
            setError('Lien de connexion invalide ou expiré. Veuillez demander un nouveau lien.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('❌ Erreur générale:', err);
        setError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [params]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    router.replace('/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#E41E31" />
          <Text style={styles.loadingText}>Connexion en cours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorTitle}>Erreur de connexion</Text>
        <Text style={styles.errorText}>{error}</Text>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.retryButton} onPress={handleRetry}>
            Réessayer
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#E41E31',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 20,
  },
  retryButton: {
    fontSize: 16,
    color: '#E41E31',
    fontWeight: '600',
    padding: 16,
  },
}); 