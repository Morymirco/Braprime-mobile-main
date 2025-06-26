import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AuthUser } from '../services/AuthService';
import { SessionService, UserSession } from '../services/SessionService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sessionValid: boolean;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ error?: any; success?: boolean }>;
  signUpWithEmailPassword: (email: string, password: string, fullName: string) => Promise<{ error?: any; success?: boolean }>;
  signOut: () => Promise<{ error?: any }>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<{ error?: any; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  // Initialiser la session au démarrage
  useEffect(() => {
    initializeSession();
  }, []);

  // Validation périodique de la session
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(async () => {
        await validateSession();
      }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      
      // Essayer de récupérer la session locale
      const localSession = await SessionService.getSession();
      
      if (localSession) {
        // Valider la session avec Supabase
        const isValid = await SessionService.refreshAccessToken();
        
        if (isValid) {
          setUser(localSession.user);
          setIsAuthenticated(true);
          setSessionValid(true);
        } else {
          // Session invalide, essayer de récupérer depuis Supabase
          await syncWithSupabase();
        }
      } else {
        // Aucune session locale, essayer de récupérer depuis Supabase
        await syncWithSupabase();
      }
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de la session:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncWithSupabase = async () => {
    try {
      const { user: currentUser, error } = await AuthService.getCurrentUser();
      
      if (error || !currentUser) {
        setUser(null);
        setIsAuthenticated(false);
        setSessionValid(false);
        return;
      }

      // Récupérer la session Supabase
      const { data: { session } } = await AuthService.getSupabaseSession();
      
      if (session) {
        // Créer et sauvegarder la session locale
        const userSession: UserSession = {
          user: currentUser,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: Date.now() + (session.expires_in * 1000),
          lastActivity: Date.now(),
        };
        
        await SessionService.saveSession(userSession);
        setUser(currentUser);
        setIsAuthenticated(true);
        setSessionValid(true);
      }
    } catch (err) {
      console.error('Erreur lors de la synchronisation avec Supabase:', err);
      setUser(null);
      setIsAuthenticated(false);
      setSessionValid(false);
    }
  };

  const validateSession = async () => {
    try {
      const isValid = await SessionService.refreshAccessToken();
      setSessionValid(isValid);
      
      if (!isValid) {
        // Session invalide, essayer de récupérer depuis Supabase
        await syncWithSupabase();
      }
    } catch (err) {
      console.error('Erreur lors de la validation de la session:', err);
      setSessionValid(false);
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user: authUser, error } = await AuthService.login(email, password);
      
      if (error) {
        setError(error);
        return { error: { message: error } };
      }
      
      if (authUser) {
        // Récupérer la session Supabase
        const { data: { session } } = await AuthService.getSupabaseSession();
        
        if (session) {
          // Créer et sauvegarder la session locale
          const userSession: UserSession = {
            user: authUser,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: Date.now() + (session.expires_in * 1000),
            lastActivity: Date.now(),
          };
          
          await SessionService.saveSession(userSession);
          setUser(authUser);
          setIsAuthenticated(true);
          setSessionValid(true);
          return { success: true };
        }
      }
      
      setError("Connexion impossible. Veuillez réessayer.");
      return { error: { message: "Connexion impossible." } };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmailPassword = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user: authUser, error } = await AuthService.signup({
        email,
        password,
        name: fullName,
      });
      
      if (error) {
        setError(error);
        return { error: { message: error } };
      }
      
      if (authUser) {
        // Récupérer la session Supabase
        const { data: { session } } = await AuthService.getSupabaseSession();
        
        if (session) {
          // Créer et sauvegarder la session locale
          const userSession: UserSession = {
            user: authUser,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: Date.now() + (session.expires_in * 1000),
            lastActivity: Date.now(),
          };
          
          await SessionService.saveSession(userSession);
          setUser(authUser);
          setIsAuthenticated(true);
          setSessionValid(true);
          return { success: true };
        }
      }
      
      setError("Inscription impossible. Veuillez réessayer.");
      return { error: { message: "Inscription impossible." } };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await AuthService.logout();
      
      if (error) {
        setError(error);
        return { error: { message: error } };
      }
      
      // Effacer la session locale
      await SessionService.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setSessionValid(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    await validateSession();
  };

  const updateUserProfile = async (updates: Partial<AuthUser>) => {
    if (!user) {
      return { error: { message: "Utilisateur non connecté" } };
    }

    try {
      const { user: updatedUser, error } = await AuthService.updateProfile(user.id, updates);
      
      if (error) {
        return { error: { message: error } };
      }
      
      if (updatedUser) {
        setUser(updatedUser);
        
        // Mettre à jour la session locale
        const localSession = await SessionService.getSession();
        if (localSession) {
          localSession.user = updatedUser;
          await SessionService.saveSession(localSession);
        }
        
        return { success: true };
      }
      
      return { error: { message: "Erreur lors de la mise à jour" } };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return { error: { message: errorMessage } };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    sessionValid,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    clearError,
    refreshSession,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 