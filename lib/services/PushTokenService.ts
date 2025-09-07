import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface PushTokenData {
  user_id: string;
  user_type: 'customer' | 'partner' | 'driver' | 'admin';
  expo_push_token: string;
  device_type?: 'ios' | 'android' | 'web' | 'unknown';
  device_id?: string;
  app_version?: string;
  os_version?: string;
}

export interface PushToken {
  id: string;
  user_id: string;
  user_type: string;
  expo_push_token: string;
  device_type: string;
  device_id?: string;
  app_version?: string;
  os_version?: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export class PushTokenService {
  private static readonly EDGE_FUNCTION_URL = 'https://jeumizxzlwjvgerrcpjr.supabase.co/functions/v1/push-tokens';

  /**
   * Obtenir le token Expo Push de l'appareil
   */
  static async getExpoPushToken(): Promise<string | null> {
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
  }

  /**
   * Enregistrer le token push sur le serveur
   */
  static async registerToken(
    userId: string, 
    userType: 'customer' | 'partner' | 'driver' | 'admin',
    deviceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Obtenir le token Expo Push
      const expoPushToken = await this.getExpoPushToken();
      if (!expoPushToken) {
        return { success: false, error: 'Impossible d\'obtenir le token Expo Push' };
      }

      // Préparer les données
      const tokenData: PushTokenData = {
        user_id: userId,
        user_type: userType,
        expo_push_token: expoPushToken,
        device_type: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'unknown',
        device_id: deviceId,
        app_version: '1.0.0', // TODO: Récupérer depuis le package.json
        os_version: Platform.Version?.toString() || 'unknown'
      };

      // Envoyer au serveur via Edge Function
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q`,
        },
        body: JSON.stringify(tokenData)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erreur lors de l\'enregistrement du token:', result);
        return { success: false, error: result.error || 'Erreur inconnue' };
      }

      console.log('Token push enregistré avec succès:', result);
      return { success: true };

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token push:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  /**
   * Récupérer les tokens d'un utilisateur
   */
  static async getUserTokens(
    userId: string, 
    userType?: string
  ): Promise<{ success: boolean; tokens?: PushToken[]; error?: string }> {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (userType) params.append('user_type', userType);

      const response = await fetch(`${this.EDGE_FUNCTION_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q`,
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Erreur inconnue' };
      }

      return { success: true, tokens: result.tokens };

    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  /**
   * Désactiver un token spécifique
   */
  static async deactivateToken(tokenId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.EDGE_FUNCTION_URL}?token_id=${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q`,
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Erreur inconnue' };
      }

      return { success: true };

    } catch (error) {
      console.error('Erreur lors de la désactivation du token:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  /**
   * Désactiver tous les tokens d'un utilisateur
   */
  static async deactivateUserTokens(
    userId: string, 
    userType?: string
  ): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (userType) params.append('user_type', userType);

      const response = await fetch(`${this.EDGE_FUNCTION_URL}?${params}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q`,
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Erreur inconnue' };
      }

      return { success: true, count: result.count };

    } catch (error) {
      console.error('Erreur lors de la désactivation des tokens utilisateur:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  /**
   * Obtenir les statistiques des tokens
   */
  static async getTokenStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const response = await fetch(`${this.EDGE_FUNCTION_URL}?stats=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q`,
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Erreur inconnue' };
      }

      return { success: true, stats: result.stats };

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  /**
   * Déterminer le type d'utilisateur basé sur le profil
   */
  static getUserTypeFromProfile(userProfile: any): 'customer' | 'partner' | 'driver' | 'admin' {
    // Logique pour déterminer le type d'utilisateur
    // À adapter selon votre logique métier
    
    if (userProfile?.role_id === 3) { // Admin role
      return 'admin';
    }
    
    if (userProfile?.role_id === 10) { // Driver role
      return 'driver';
    }
    
    if (userProfile?.role_id === 2) { // Partner role
      return 'partner';
    }
    
    // Par défaut, c'est un customer
    return 'customer';
  }

  /**
   * Initialiser les notifications et enregistrer le token
   */
  static async initializeNotifications(
    userId: string, 
    userProfile: any,
    deviceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Configurer le gestionnaire de notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Déterminer le type d'utilisateur
      const userType = this.getUserTypeFromProfile(userProfile);

      // Enregistrer le token
      const result = await this.registerToken(userId, userType, deviceId);

      if (result.success) {
        console.log('Notifications initialisées avec succès');
      } else {
        console.warn('Échec de l\'initialisation des notifications:', result.error);
      }

      return result;

    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
      return { success: false, error: 'Erreur d\'initialisation' };
    }
  }

  /**
   * Nettoyer les tokens lors de la déconnexion
   */
  static async cleanupOnLogout(userId: string): Promise<void> {
    try {
      await this.deactivateUserTokens(userId);
      console.log('Tokens push nettoyés lors de la déconnexion');
    } catch (error) {
      console.error('Erreur lors du nettoyage des tokens:', error);
    }
  }
}

export default PushTokenService;
