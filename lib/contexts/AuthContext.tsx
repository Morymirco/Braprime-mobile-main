import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AuthUser } from '../services/AuthService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ error?: any; success?: boolean }>;
  signUpWithEmailPassword: (email: string, password: string, fullName: string) => Promise<{ error?: any; success?: boolean }>;
  signOut: () => Promise<{ error?: any }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur actuel au démarrage
    const getCurrentUser = async () => {
      try {
        const { user: currentUser, error } = await AuthService.getCurrentUser();
        if (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        setUser(authUser);
        return { success: true };
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
        setUser(authUser);
        return { success: true };
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
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    clearError,
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