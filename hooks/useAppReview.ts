import { useCallback, useEffect, useState } from 'react';
import { AppReview, AppReviewService, CreateAppReviewData } from '../lib/services/AppReviewService';

export const useAppReview = () => {
  const [userReview, setUserReview] = useState<AppReview | null>(null);
  const [allReviews, setAllReviews] = useState<AppReview[]>([]);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'avis de l'utilisateur actuel
  const fetchUserReview = useCallback(async () => {
    try {
      const { data, error } = await AppReviewService.getUserAppReview();
      if (error) {
        setError(error);
        return;
      }
      setUserReview(data);
    } catch (err) {
      setError('Erreur lors de la récupération de votre avis');
    }
  }, []);

  // Récupérer tous les avis
  const fetchAllReviews = useCallback(async () => {
    try {
      const { data, error } = await AppReviewService.getAppReviews();
      if (error) {
        setError(error);
        return;
      }
      setAllReviews(data || []);
    } catch (err) {
      setError('Erreur lors de la récupération des avis');
    }
  }, []);

  // Récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await AppReviewService.getAppReviewStats();
      if (error) {
        setError(error);
        return;
      }
      setStats(data);
    } catch (err) {
      setError('Erreur lors de la récupération des statistiques');
    }
  }, []);

  // Créer un nouvel avis
  const createReview = useCallback(async (reviewData: CreateAppReviewData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await AppReviewService.createAppReview(reviewData);
      if (error) {
        setError(error);
        return { success: false, error };
      }

      setUserReview(data);
      // Rafraîchir les statistiques et tous les avis
      await Promise.all([fetchStats(), fetchAllReviews()]);

      return { success: true, data };
    } catch (err) {
      const errorMessage = 'Erreur lors de la création de l\'avis';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchAllReviews]);

  // Mettre à jour un avis existant
  const updateReview = useCallback(async (reviewId: string, reviewData: Partial<CreateAppReviewData>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await AppReviewService.updateAppReview(reviewId, reviewData);
      if (error) {
        setError(error);
        return { success: false, error };
      }

      setUserReview(data);
      // Rafraîchir les statistiques et tous les avis
      await Promise.all([fetchStats(), fetchAllReviews()]);

      return { success: true, data };
    } catch (err) {
      const errorMessage = 'Erreur lors de la mise à jour de l\'avis';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchAllReviews]);

  // Supprimer un avis
  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { success, error } = await AppReviewService.deleteAppReview(reviewId);
      if (!success) {
        setError(error || 'Erreur lors de la suppression');
        return { success: false, error };
      }

      setUserReview(null);
      // Rafraîchir les statistiques et tous les avis
      await Promise.all([fetchStats(), fetchAllReviews()]);

      return { success: true };
    } catch (err) {
      const errorMessage = 'Erreur lors de la suppression de l\'avis';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchAllReviews]);

  // Rafraîchir toutes les données
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchUserReview(), fetchAllReviews(), fetchStats()]);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  }, [fetchUserReview, fetchAllReviews, fetchStats]);

  // Charger les données au montage
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    userReview,
    allReviews,
    stats,
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    refetch
  };
}; 