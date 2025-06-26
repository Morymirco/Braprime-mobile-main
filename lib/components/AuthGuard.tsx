import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated, sessionValid, refreshSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        router.replace(redirectTo);
      } else if (requireAuth && isAuthenticated && !sessionValid) {
        // Session invalide, essayer de la rafraîchir
        refreshSession();
      }
    }
  }, [user, loading, isAuthenticated, sessionValid, requireAuth, redirectTo, router, refreshSession]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E31837" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E31837" />
        <Text style={styles.loadingText}>Redirection...</Text>
      </View>
    );
  }

  if (requireAuth && isAuthenticated && !sessionValid) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E31837" />
        <Text style={styles.loadingText}>Validation de la session...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 