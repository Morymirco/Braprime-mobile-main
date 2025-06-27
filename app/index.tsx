import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SessionService } from '../lib/services/SessionService';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('🔄 Vérification de l\'authentification...');
      
      // Vérifier si une session existe
      const session = await SessionService.getSession();
      
      if (session && session.user) {
        console.log('✅ Session utilisateur trouvée, redirection vers l\'app principale');
        setIsAuthenticated(true);
      } else {
        console.log('❌ Aucune session trouvée, redirection vers le splash');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E31837' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Chargement...</Text>
      </View>
    );
  }

  // Si l'utilisateur est authentifié, aller directement à l'app principale
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Sinon, aller au splash d'initialisation
  return <Redirect href="/initial-splash" />;
} 