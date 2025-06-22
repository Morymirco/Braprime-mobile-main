import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  signInWithPhone: (phone: string) => Promise<{ error?: any; success?: boolean }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error?: any; success?: boolean; data?: any }>;
  signOut: () => Promise<{ error?: any }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setError(error.message);
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithPhone = async (phone: string) => {
    setLoading(true);
    setError(null);
    setOtpSent(false);
    
    try {
      console.log('🔐 Tentative de connexion avec le numéro:', `+224${phone}`);
      
      const { error } = await supabase.auth.signInWithOtp({ 
        phone: `+224${phone}`,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) {
        console.error('❌ Erreur de connexion:', error);
        setError(error.message);
        return { error };
      }
      
      console.log('✅ Code OTP envoyé avec succès');
      setOtpSent(true);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Exception lors de la connexion:', err);
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Vérification du code OTP:', token);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+224${phone}`,
        token,
        type: 'sms'
      });
      
      if (error) {
        console.error('❌ Erreur de vérification OTP:', error);
        setError(error.message);
        return { error };
      }
      
      console.log('✅ OTP vérifié avec succès, utilisateur connecté:', data.user?.id);
      
      // Vérifier si le profil a été créé
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.warn('⚠️ Profil non trouvé, création manuelle nécessaire:', profileError);
          // Essayer de créer le profil manuellement
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              phone: data.user.phone,
              full_name: data.user.user_metadata?.full_name || ''
            });
          
          if (insertError) {
            console.error('❌ Erreur lors de la création manuelle du profil:', insertError);
            setError('Erreur lors de la création du profil utilisateur. Veuillez contacter le support.');
            return { error: insertError };
          }
        }
      }
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Exception lors de la vérification OTP:', err);
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
      const { error } = await supabase.auth.signOut();
      if (error) setError(error.message);
      return { error };
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
    session,
    user,
    loading,
    error,
    otpSent,
    signInWithPhone,
    verifyOtp,
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