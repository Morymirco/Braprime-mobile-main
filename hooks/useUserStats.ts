import { useState, useCallback, useEffect } from 'react';
import { UserStatsService, UserStats } from '../lib/services/UserStatsService';

interface UseUserStatsReturn {
  stats: UserStats;
  loading: boolean;
  error: string | null;
  loadStats: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  clearError: () => void;
}

export const useUserStats = (userId?: string): UseUserStatsReturn => {
  const [stats, setStats] = useState<UserStats>({
    orders: 0,
    reservations: 0,
    favorites: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const userStats = await UserStatsService.getUserStatsWithCache(userId);
      setStats(userStats);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Erreur dans useUserStats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const forceRefresh = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Vider le cache et recharger
      UserStatsService.clearCache(userId);
      const userStats = await UserStatsService.getUserStats(userId);
      
      setStats(userStats);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Erreur lors du rechargement forcé:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger automatiquement au montage et quand userId change
  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId, loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
    forceRefresh,
    clearError
  };
};
