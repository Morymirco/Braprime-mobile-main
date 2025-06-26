import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../lib/contexts/AuthContext';

interface SyncConfig {
  enabled: boolean;
  interval: number; // en millisecondes
  retryAttempts: number;
  retryDelay: number; // en millisecondes
}

interface SyncCallback {
  id: string;
  callback: () => Promise<void>;
  priority: 'high' | 'medium' | 'low';
  lastSync?: number;
  errorCount?: number;
}

export function useDataSync(config: SyncConfig = {
  enabled: true,
  interval: 30000, // 30 secondes
  retryAttempts: 3,
  retryDelay: 5000, // 5 secondes
}) {
  const { user } = useAuth();
  const syncCallbacksRef = useRef<Map<string, SyncCallback>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);

  // Fonction pour enregistrer un callback de synchronisation
  const registerSync = useCallback((
    id: string, 
    callback: () => Promise<void>, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    console.log(`🔄 Enregistrement de la synchronisation: ${id} (${priority})`);
    syncCallbacksRef.current.set(id, {
      id,
      callback,
      priority,
      lastSync: 0,
      errorCount: 0,
    });
  }, []);

  // Fonction pour désenregistrer un callback de synchronisation
  const unregisterSync = useCallback((id: string) => {
    console.log(`❌ Désenregistrement de la synchronisation: ${id}`);
    syncCallbacksRef.current.delete(id);
  }, []);

  // Fonction pour forcer la synchronisation d'un callback spécifique
  const forceSync = useCallback(async (id: string) => {
    const callback = syncCallbacksRef.current.get(id);
    if (!callback) {
      console.warn(`⚠️ Callback de synchronisation non trouvé: ${id}`);
      return;
    }

    await executeSync(callback);
  }, []);

  // Fonction pour forcer la synchronisation de tous les callbacks
  const forceSyncAll = useCallback(async () => {
    console.log('🔄 Synchronisation forcée de tous les callbacks');
    const callbacks = Array.from(syncCallbacksRef.current.values());
    
    // Trier par priorité
    const sortedCallbacks = callbacks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const callback of sortedCallbacks) {
      await executeSync(callback);
    }
  }, []);

  // Fonction pour exécuter une synchronisation avec retry
  const executeSync = useCallback(async (syncCallback: SyncCallback) => {
    if (!isOnlineRef.current) {
      console.log(`📱 Hors ligne, synchronisation ignorée: ${syncCallback.id}`);
      return;
    }

    const now = Date.now();
    const timeSinceLastSync = now - (syncCallback.lastSync || 0);
    
    // Éviter les synchronisations trop fréquentes
    if (timeSinceLastSync < 5000) { // 5 secondes minimum
      console.log(`⏱️ Synchronisation trop récente, ignorée: ${syncCallback.id}`);
      return;
    }

    console.log(`🔄 Exécution de la synchronisation: ${syncCallback.id}`);
    
    try {
      await syncCallback.callback();
      
      // Mise à jour du statut de succès
      syncCallbacksRef.current.set(syncCallback.id, {
        ...syncCallback,
        lastSync: now,
        errorCount: 0,
      });
      
      console.log(`✅ Synchronisation réussie: ${syncCallback.id}`);
    } catch (error) {
      console.error(`❌ Erreur de synchronisation: ${syncCallback.id}`, error);
      
      const errorCount = (syncCallback.errorCount || 0) + 1;
      
      // Mise à jour du statut d'erreur
      syncCallbacksRef.current.set(syncCallback.id, {
        ...syncCallback,
        errorCount,
      });

      // Retry automatique si le nombre d'erreurs est inférieur au maximum
      if (errorCount < config.retryAttempts) {
        console.log(`🔄 Retry automatique dans ${config.retryDelay}ms: ${syncCallback.id}`);
        setTimeout(() => {
          executeSync(syncCallback);
        }, config.retryDelay);
      } else {
        console.error(`❌ Nombre maximum de tentatives atteint: ${syncCallback.id}`);
      }
    }
  }, [config.retryAttempts, config.retryDelay]);

  // Fonction pour démarrer la synchronisation périodique
  const startPeriodicSync = useCallback(() => {
    if (!config.enabled || !user?.id) {
      console.log('⏸️ Synchronisation périodique désactivée');
      return;
    }

    console.log(`🔄 Démarrage de la synchronisation périodique (${config.interval}ms)`);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (isOnlineRef.current && appStateRef.current === 'active') {
        console.log('🔄 Synchronisation périodique en cours...');
        await forceSyncAll();
      }
    }, config.interval);
  }, [config.enabled, config.interval, user?.id, forceSyncAll]);

  // Fonction pour arrêter la synchronisation périodique
  const stopPeriodicSync = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ Arrêt de la synchronisation périodique');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Gestion du changement d'état de l'application
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    console.log(`📱 Changement d'état de l'app: ${appStateRef.current} -> ${nextAppState}`);
    
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // L'app revient au premier plan
      console.log('🔄 App au premier plan, synchronisation immédiate');
      setTimeout(() => {
        forceSyncAll();
      }, 1000); // Délai de 1 seconde pour laisser l'app se stabiliser
    }
    
    appStateRef.current = nextAppState;
  }, [forceSyncAll]);

  // Gestion de la connectivité (simulation)
  const checkConnectivity = useCallback(async () => {
    try {
      // Ici vous pourriez implémenter une vraie vérification de connectivité
      // Pour l'instant, on simule une connexion toujours active
      const wasOffline = !isOnlineRef.current;
      isOnlineRef.current = true;
      
      if (wasOffline) {
        console.log('🌐 Connexion rétablie, synchronisation immédiate');
        setTimeout(() => {
          forceSyncAll();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de connectivité:', error);
      isOnlineRef.current = false;
    }
  }, [forceSyncAll]);

  // Initialisation
  useEffect(() => {
    if (user?.id) {
      startPeriodicSync();
      
      // Vérification de connectivité périodique
      const connectivityInterval = setInterval(checkConnectivity, 10000); // 10 secondes
      
      return () => {
        stopPeriodicSync();
        clearInterval(connectivityInterval);
      };
    } else {
      stopPeriodicSync();
    }
  }, [user?.id, startPeriodicSync, stopPeriodicSync, checkConnectivity]);

  // Gestion du changement d'état de l'application
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [handleAppStateChange]);

  // Synchronisation immédiate au montage si l'utilisateur est connecté
  useEffect(() => {
    if (user?.id && config.enabled) {
      console.log('🚀 Synchronisation initiale au montage');
      setTimeout(() => {
        forceSyncAll();
      }, 2000); // Délai de 2 secondes pour laisser l'app se charger
    }
  }, [user?.id, config.enabled, forceSyncAll]);

  return {
    registerSync,
    unregisterSync,
    forceSync,
    forceSyncAll,
    startPeriodicSync,
    stopPeriodicSync,
    isOnline: isOnlineRef.current,
  };
} 