import { supabase } from '../supabase/config';

export interface BusinessReview {
  id: string;
  user_id: string;
  user_name: string;
  business_id: number;
  order_id?: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessReviewData {
  business_id: number;
  rating: number;
  comment?: string;
  images?: string[];
}

export const BusinessReviewService = {
  // Récupérer tous les avis d'un commerce
  getBusinessReviews: async (businessId: number): Promise<{ data: BusinessReview[] | null; error: string | null }> => {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des avis:', error);
        return { data: null, error: error.message };
      }

      // Récupérer les profils utilisateurs pour les avis (comme le client)
      const reviewsWithProfiles = await Promise.all(
        (reviews || []).map(async (review) => {
          if (review.user_id) {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('name, profile_image')
              .eq('id', review.user_id)
              .single();
            
            return {
              ...review,
              user_name: userProfile?.name || 'Utilisateur',
              user_profile: userProfile
            };
          }
          return {
            ...review,
            user_name: 'Utilisateur'
          };
        })
      );

      return { data: reviewsWithProfiles, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Récupérer l'avis de l'utilisateur actuel pour un commerce
  getUserBusinessReview: async (businessId: number): Promise<{ data: BusinessReview | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erreur lors de la récupération de l\'avis utilisateur:', error);
        return { data: null, error: error.message };
      }

      return { data: review, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'avis utilisateur:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Créer un nouvel avis pour un commerce
  createBusinessReview: async (reviewData: CreateBusinessReviewData): Promise<{ data: BusinessReview | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      // Vérifier si l'utilisateur a déjà donné un avis pour ce commerce
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', reviewData.business_id)
        .single();

      if (existingReview) {
        return { data: null, error: 'Vous avez déjà donné un avis pour ce commerce' };
      }

      // Récupérer le nom de l'utilisateur
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          business_id: reviewData.business_id,
          rating: reviewData.rating,
          comment: reviewData.comment || null,
          images: reviewData.images || [],
          order_id: null
        })
        .select('*')
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'avis:', error);
        return { data: null, error: error.message };
      }

      return { data: review, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Mettre à jour un avis de commerce existant
  updateBusinessReview: async (reviewId: string, reviewData: Partial<CreateBusinessReviewData>): Promise<{ data: BusinessReview | null; error: string | null }> => {
    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          rating: reviewData.rating,
          comment: reviewData.comment,
          images: reviewData.images,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select('*')
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'avis:', error);
        return { data: null, error: error.message };
      }

      return { data: review, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avis:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Supprimer un avis de commerce
  deleteBusinessReview: async (reviewId: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        console.error('Erreur lors de la suppression de l\'avis:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  // Récupérer les statistiques des avis d'un commerce
  getBusinessReviewStats: async (businessId: number): Promise<{ data: { averageRating: number; totalReviews: number; ratingDistribution: Record<number, number> } | null; error: string | null }> => {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId);

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return { data: null, error: error.message };
      }

      if (!reviews || reviews.length === 0) {
        return { 
          data: { 
            averageRating: 0, 
            totalReviews: 0, 
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
          }, 
          error: null 
        };
      }

      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return { 
        data: { 
          averageRating: Math.round(averageRating * 10) / 10, 
          totalReviews, 
          ratingDistribution 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  }
}; 