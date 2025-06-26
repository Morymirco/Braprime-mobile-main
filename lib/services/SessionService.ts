import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase/config';
import { AuthUser } from './AuthService';

export interface UserSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  lastActivity: number;
}

export interface SessionData {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastSync: number;
}

export class SessionService {
  private static SESSION_KEY = '@braprime_session';
  private static USER_PREFERENCES_KEY = '@braprime_user_preferences';
  private static SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 heures

  /**
   * Sauvegarder la session utilisateur
   */
  static async saveSession(session: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
    }
  }

  /**
   * Récupérer la session utilisateur
   */
  static async getSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: UserSession = JSON.parse(sessionData);
      
      if (this.isSessionExpired(session)) {
        await this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }
  }

  /**
   * Vérifier si la session a expiré
   */
  static isSessionExpired(session: UserSession): boolean {
    return Date.now() > session.expiresAt;
  }

  /**
   * Mettre à jour l'activité de la session
   */
  static async updateSessionActivity(): Promise<void> {
    try {
      const sessionData = await this.getSession();
      if (sessionData) {
        sessionData.lastActivity = Date.now();
        await this.saveSession(sessionData);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'activité:', error);
    }
  }

  /**
   * Rafraîchir le token d'accès
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) return false;

      if (data.session) {
        const sessionData = await this.getSession();
        if (sessionData) {
          sessionData.accessToken = data.session.access_token;
          sessionData.refreshToken = data.session.refresh_token;
          sessionData.expiresAt = Date.now() + (data.session.expires_in * 1000);
          await this.saveSession(sessionData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  }

  /**
   * Vérifier et maintenir la session
   */
  static async validateSession(): Promise<boolean> {
    try {
      const sessionData = await this.getSession();
      
      if (!sessionData) {
        return false;
      }

      // Vérifier si le token va expirer bientôt (dans les 5 minutes)
      const expiresIn = sessionData.expiresAt - Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (expiresIn < fiveMinutes) {
        console.log('🔄 Token va expirer bientôt, rafraîchissement...');
        return await this.refreshAccessToken();
      }

      // Mettre à jour l'activité
      await this.updateSessionActivity();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la validation de la session:', error);
      return false;
    }
  }

  /**
   * Effacer la session
   */
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Erreur lors de l\'effacement de la session:', error);
    }
  }

  /**
   * Sauvegarder les préférences utilisateur
   */
  static async saveUserPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des préférences:', error);
    }
  }

  /**
   * Récupérer les préférences utilisateur
   */
  static async getUserPreferences(): Promise<any | null> {
    try {
      const preferences = await AsyncStorage.getItem(this.USER_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences:', error);
      return null;
    }
  }

  /**
   * Créer une session à partir des données Supabase
   */
  static createSessionFromSupabase(
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): UserSession {
    return {
      user,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000),
      lastActivity: Date.now(),
    };
  }

  /**
   * Obtenir les statistiques de session
   */
  static async getSessionStats(): Promise<{
    isAuthenticated: boolean;
    sessionAge: number | null;
    lastActivity: number | null;
    expiresIn: number | null;
  }> {
    try {
      const sessionData = await this.getSession();
      
      if (!sessionData) {
        return {
          isAuthenticated: false,
          sessionAge: null,
          lastActivity: null,
          expiresIn: null,
        };
      }

      const now = Date.now();
      const sessionAge = now - sessionData.lastActivity;
      const expiresIn = sessionData.expiresAt - now;

      return {
        isAuthenticated: true,
        sessionAge,
        lastActivity: sessionData.lastActivity,
        expiresIn: expiresIn > 0 ? expiresIn : 0,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats de session:', error);
      return {
        isAuthenticated: false,
        sessionAge: null,
        lastActivity: null,
        expiresIn: null,
      };
    }
  }

  /**
   * Forcer la synchronisation avec Supabase
   */
  static async forceSync(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await this.clearSession();
        return false;
      }

      // Récupérer le profil utilisateur
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role_id === 2 ? 'partner' : 'customer',
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image,
        };

        const userSession = this.createSessionFromSupabase(
          user,
          session.access_token,
          session.refresh_token,
          session.expires_in
        );

        await this.saveSession(userSession);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error);
      return false;
    }
  }
} 