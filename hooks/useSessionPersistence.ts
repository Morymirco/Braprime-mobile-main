import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../lib/contexts/AuthContext';
import { SessionService } from '../lib/services/SessionService';

export function useSessionPersistence() {
  const { isAuthenticated, refreshSession } = useAuth();
  const appState = useRef(AppState.currentState);
  const lastActivityRef = useRef<number>(Date.now());

  // Mettre à jour l'activité quand l'utilisateur interagit
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      SessionService.updateSessionActivity();
    };

    // Écouter les changements d'état de l'application
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // L'application revient au premier plan
        console.log('🔄 Application revenue au premier plan, validation de session...');
        updateActivity();
        refreshSession();
      } else if (nextAppState.match(/inactive|background/)) {
        // L'application passe en arrière-plan
        console.log('📱 Application en arrière-plan, sauvegarde de l\'activité...');
        updateActivity();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, refreshSession]);

  // Validation périodique de la session
  useEffect(() => {
    if (!isAuthenticated) return;

    const validateInterval = setInterval(async () => {
      try {
        const isValid = await SessionService.validateSession();
        if (!isValid) {
          console.log('⚠️ Session invalide détectée, tentative de rafraîchissement...');
          await refreshSession();
        }
      } catch (error) {
        console.error('❌ Erreur lors de la validation périodique:', error);
      }
    }, 5 * 60 * 1000); // Toutes les 5 minutes

    return () => clearInterval(validateInterval);
  }, [isAuthenticated, refreshSession]);

  // Mise à jour de l'activité toutes les minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > 60 * 1000) { // Plus d'une minute d'inactivité
        SessionService.updateSessionActivity();
        lastActivityRef.current = now;
      }
    }, 60 * 1000); // Vérifier toutes les minutes

    return () => clearInterval(activityInterval);
  }, [isAuthenticated]);

  return {
    lastActivity: lastActivityRef.current,
  };
} 