import { Session, User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';

export function useSupabaseAuth() {
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

  // Connexion par OTP (SMS)
  const signInWithPhone = useCallback(async (phone: string) => {
    setLoading(true);
    setError(null);
    setOtpSent(false);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        phone: `+224${phone}`,
        options: {
          shouldCreateUser: true, // Créer automatiquement un utilisateur s'il n'existe pas
        }
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      setOtpSent(true);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, []);

  // Vérification OTP
  const verifyOtp = useCallback(async (phone: string, token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+224${phone}`,
        token,
        type: 'sms'
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, []);

  // Déconnexion
  const signOut = useCallback(async () => {
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
  }, []);

  // Réinitialiser l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
} 