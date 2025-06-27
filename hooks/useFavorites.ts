import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { FavoriteBusiness, FavoriteMenuItem, FavoritesService } from '../lib/services/FavoritesService';

interface UseFavoritesReturn {
  // États
  favoriteBusinesses: FavoriteBusiness[];
  favoriteMenuItems: FavoriteMenuItem[];
  loading: boolean;
  error: string | null;
  
  // Actions pour les commerces
  addFavoriteBusiness: (businessId: string) => Promise<{ success: boolean; error?: string }>;
  removeFavoriteBusiness: (businessId: string) => Promise<{ success: boolean; error?: string }>;
  isBusinessFavorite: (businessId: string) => Promise<boolean>;
  
  // Actions pour les articles
  addFavoriteMenuItem: (menuItemId: string) => Promise<{ success: boolean; error?: string }>;
  removeFavoriteMenuItem: (menuItemId: string) => Promise<{ success: boolean; error?: string }>;
  isMenuItemFavorite: (menuItemId: string) => Promise<boolean>;
  
  // Actions générales
  refetch: () => Promise<void>;
  clearAllFavorites: () => Promise<{ success: boolean; error?: string }>;
}

export function useFavorites(): UseFavoritesReturn {
  const { user } = useAuth();
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<FavoriteBusiness[]>([]);
  const [favoriteMenuItems, setFavoriteMenuItems] = useState<FavoriteMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!user) {
      setFavoriteBusinesses([]);
      setFavoriteMenuItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [businesses, menuItems] = await Promise.all([
        FavoritesService.getFavoriteBusinesses(user.id),
        FavoritesService.getFavoriteMenuItems(user.id)
      ]);

      setFavoriteBusinesses(businesses);
      setFavoriteMenuItems(menuItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des favoris';
      setError(errorMessage);
      console.error('Erreur dans useFavorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const addFavoriteBusiness = async (businessId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      await FavoritesService.addFavoriteBusiness(user.id, businessId);
      await fetchFavorites(); // Recharger les favoris
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout aux favoris';
      console.error('Erreur lors de l\'ajout du commerce aux favoris:', err);
      return { success: false, error: errorMessage };
    }
  };

  const removeFavoriteBusiness = async (businessId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      await FavoritesService.removeFavoriteBusiness(user.id, businessId);
      setFavoriteBusinesses(prev => prev.filter(fav => fav.business_id !== businessId));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression des favoris';
      console.error('Erreur lors de la suppression du commerce des favoris:', err);
      return { success: false, error: errorMessage };
    }
  };

  const isBusinessFavorite = async (businessId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      return await FavoritesService.isBusinessFavorite(user.id, businessId);
    } catch (err) {
      console.error('Erreur lors de la vérification du favori commerce:', err);
      return false;
    }
  };

  const addFavoriteMenuItem = async (menuItemId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      await FavoritesService.addFavoriteMenuItem(user.id, menuItemId);
      await fetchFavorites(); // Recharger les favoris
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout aux favoris';
      console.error('Erreur lors de l\'ajout de l\'article aux favoris:', err);
      return { success: false, error: errorMessage };
    }
  };

  const removeFavoriteMenuItem = async (menuItemId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      await FavoritesService.removeFavoriteMenuItem(user.id, menuItemId);
      setFavoriteMenuItems(prev => prev.filter(fav => fav.menu_item_id !== menuItemId));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression des favoris';
      console.error('Erreur lors de la suppression de l\'article des favoris:', err);
      return { success: false, error: errorMessage };
    }
  };

  const isMenuItemFavorite = async (menuItemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      return await FavoritesService.isMenuItemFavorite(user.id, menuItemId);
    } catch (err) {
      console.error('Erreur lors de la vérification du favori article:', err);
      return false;
    }
  };

  const clearAllFavorites = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      await FavoritesService.clearAllFavorites(user.id);
      setFavoriteBusinesses([]);
      setFavoriteMenuItems([]);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression des favoris';
      console.error('Erreur lors de la suppression de tous les favoris:', err);
      return { success: false, error: errorMessage };
    }
  };

  return {
    favoriteBusinesses,
    favoriteMenuItems,
    loading,
    error,
    addFavoriteBusiness,
    removeFavoriteBusiness,
    isBusinessFavorite,
    addFavoriteMenuItem,
    removeFavoriteMenuItem,
    isMenuItemFavorite,
    refetch: fetchFavorites,
    clearAllFavorites,
  };
} 