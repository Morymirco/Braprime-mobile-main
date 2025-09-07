import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../lib/contexts/AuthContext';
import PushTokenService from '../lib/services/PushTokenService';

interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  permissionStatus: string;
  tokenRegistered: boolean;
  loading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    expoPushToken: null,
    notification: null,
    permissionStatus: '',
    tokenRegistered: false,
    loading: false,
    error: null,
  });

  const { user, isAuthenticated } = useAuth();

  // Configuration des notifications
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  // Initialiser les notifications au démarrage
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Enregistrer automatiquement le token quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && user && state.expoPushToken && !state.tokenRegistered) {
      registerTokenOnServer();
    }
  }, [isAuthenticated, user, state.expoPushToken, state.tokenRegistered]);

  const initializeNotifications = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Obtenir le token Expo Push
      const token = await getExpoPushToken();
      setState(prev => ({ ...prev, expoPushToken: token }));

      // Configurer les listeners
      setupNotificationListeners();

      // Vérifier les permissions
      const { status } = await Notifications.getPermissionsAsync();
      setState(prev => ({ ...prev, permissionStatus: status }));

    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getExpoPushToken = async (): Promise<string | null> => {
    try {
      // Vérifier les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Permissions de notification refusées');
        return null;
      }

      // Configurer le canal de notification pour Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Obtenir le token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token Expo Push:', error);
      return null;
    }
  };

  const setupNotificationListeners = () => {
    // Écouter les notifications reçues
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setState(prev => ({ ...prev, notification }));
    });

    // Écouter les interactions avec les notifications
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Ici vous pouvez gérer la navigation ou d'autres actions
    });

    // Nettoyer les listeners au démontage
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const registerTokenOnServer = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    if (!state.expoPushToken) {
      return { success: false, error: 'Aucun token Expo Push disponible' };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await PushTokenService.registerToken(user.id, 'customer');
      
      if (result.success) {
        setState(prev => ({ ...prev, tokenRegistered: true }));
        return { success: true };
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Erreur inconnue' }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const requestPermissions = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setState(prev => ({ ...prev, permissionStatus: status }));
      
      if (status === 'granted') {
        // Réessayer d'obtenir le token
        const token = await getExpoPushToken();
        setState(prev => ({ ...prev, expoPushToken: token }));
        return { success: true };
      } else {
        return { success: false, error: 'Permissions refusées' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: { seconds: 1 },
      });
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification locale:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'annulation des notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  };

  const getUserTokens = async () => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      const result = await PushTokenService.getUserTokens(user.id);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  };

  return {
    ...state,
    registerTokenOnServer,
    requestPermissions,
    sendLocalNotification,
    cancelAllNotifications,
    getUserTokens,
    refreshToken: getExpoPushToken,
  };
}

export default usePushNotifications;
