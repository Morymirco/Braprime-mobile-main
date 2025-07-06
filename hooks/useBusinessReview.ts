import { useCallback, useEffect, useState } from 'react';
import { BusinessReview, BusinessReviewService, CreateBusinessReviewData } from '../lib/services/BusinessReviewService';

export const useBusinessReview = (businessId: number) => {
  const [userReview, setUserReview] = useState<BusinessReview | null>(null);
  const [allReviews, setAllReviews] = useState<BusinessReview[]>([]);
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
      const { data, error } = await BusinessReviewService.getUserBusinessReview(businessId);
      if (error) {
        setError(error);
        return;
      }
      setUserReview(data);
    } catch (err) {
      setError('Erreur lors de la récupération de votre avis');
    }
  }, [businessId]);

  // Récupérer tous les avis
  const fetchAllReviews = useCallback(async () => {
    try {
      const { data, error } = await BusinessReviewService.getBusinessReviews(businessId);
      if (error) {
        setError(error);
        return;
      }
      setAllReviews(data || []);
    } catch (err) {
      setError('Erreur lors de la récupération des avis');
    }
  }, [businessId]);

  // Récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await BusinessReviewService.getBusinessReviewStats(businessId);
      if (error) {
        setError(error);
        return;
      }
      setStats(data);
    } catch (err) {
      setError('Erreur lors de la récupération des statistiques');
    }
  }, [businessId]);

  // Créer un nouvel avis
  const createReview = useCallback(async (reviewData: Omit<CreateBusinessReviewData, 'business_id'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await BusinessReviewService.createBusinessReview({
        ...reviewData,
        business_id: businessId
      });
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
  }, [businessId, fetchStats, fetchAllReviews]);

  // Mettre à jour un avis existant
  const updateReview = useCallback(async (reviewId: string, reviewData: Partial<CreateBusinessReviewData>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await BusinessReviewService.updateBusinessReview(reviewId, reviewData);
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

      const { success, error } = await BusinessReviewService.deleteBusinessReview(reviewId);
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
    if (businessId) {
      refetch();
    }
  }, [businessId, refetch]);

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