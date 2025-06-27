import { supabase } from '../supabase/config';

export interface FavoriteBusiness {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
  business: {
    id: string;
    name: string;
    description: string;
    image: string;
    address: string;
    rating: number;
    delivery_time: string;
    minimum_order: number;
    is_open: boolean;
    business_type: {
      id: number;
      name: string;
    };
  };
}

export interface FavoriteMenuItem {
  id: string;
  user_id: string;
  menu_item_id: string;
  created_at: string;
  menu_item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    is_popular: boolean;
    business: {
      id: string;
      name: string;
    };
  };
}

export class FavoritesService {
  // Récupérer tous les commerces favoris d'un utilisateur
  static async getFavoriteBusinesses(userId: string): Promise<FavoriteBusiness[]> {
    try {
      const { data, error } = await supabase
        .from('favorite_businesses')
        .select(`
          id,
          user_id,
          business_id,
          created_at,
          business:businesses (
            id,
            name,
            description,
            image,
            address,
            rating,
            delivery_time,
            minimum_order,
            is_open,
            business_type:business_types (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commerces favoris:', error);
      throw error;
    }
  }

  // Récupérer tous les articles favoris d'un utilisateur
  static async getFavoriteMenuItems(userId: string): Promise<FavoriteMenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('favorite_menu_items')
        .select(`
          id,
          user_id,
          menu_item_id,
          created_at,
          menu_item:menu_items (
            id,
            name,
            description,
            price,
            image,
            is_popular,
            business:businesses (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des articles favoris:', error);
      throw error;
    }
  }

  // Ajouter un commerce aux favoris
  static async addFavoriteBusiness(userId: string, businessId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorite_businesses')
        .insert({
          user_id: userId,
          business_id: businessId,
        });

      if (error) {
        if (error.code === '23505') { // Violation de contrainte unique
          return true; // Déjà dans les favoris
        }
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commerce aux favoris:', error);
      throw error;
    }
  }

  // Ajouter un article aux favoris
  static async addFavoriteMenuItem(userId: string, menuItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorite_menu_items')
        .insert({
          user_id: userId,
          menu_item_id: menuItemId,
        });

      if (error) {
        if (error.code === '23505') { // Violation de contrainte unique
          return true; // Déjà dans les favoris
        }
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article aux favoris:', error);
      throw error;
    }
  }

  // Retirer un commerce des favoris
  static async removeFavoriteBusiness(userId: string, businessId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorite_businesses')
        .delete()
        .eq('user_id', userId)
        .eq('business_id', businessId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du commerce des favoris:', error);
      throw error;
    }
  }

  // Retirer un article des favoris
  static async removeFavoriteMenuItem(userId: string, menuItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorite_menu_items')
        .delete()
        .eq('user_id', userId)
        .eq('menu_item_id', menuItemId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article des favoris:', error);
      throw error;
    }
  }

  // Vérifier si un commerce est dans les favoris
  static async isBusinessFavorite(userId: string, businessId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorite_businesses')
        .select('id')
        .eq('user_id', userId)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = aucun résultat
        throw new Error(error.message);
      }

      return !!data;
    } catch (error) {
      console.error('Erreur lors de la vérification du favori commerce:', error);
      return false;
    }
  }

  // Vérifier si un article est dans les favoris
  static async isMenuItemFavorite(userId: string, menuItemId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorite_menu_items')
        .select('id')
        .eq('user_id', userId)
        .eq('menu_item_id', menuItemId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = aucun résultat
        throw new Error(error.message);
      }

      return !!data;
    } catch (error) {
      console.error('Erreur lors de la vérification du favori article:', error);
      return false;
    }
  }

  // Supprimer tous les favoris d'un utilisateur
  static async clearAllFavorites(userId: string): Promise<boolean> {
    try {
      // Supprimer les commerces favoris
      const { error: businessError } = await supabase
        .from('favorite_businesses')
        .delete()
        .eq('user_id', userId);

      if (businessError) {
        throw new Error(businessError.message);
      }

      // Supprimer les articles favoris
      const { error: menuError } = await supabase
        .from('favorite_menu_items')
        .delete()
        .eq('user_id', userId);

      if (menuError) {
        throw new Error(menuError.message);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les favoris:', error);
      throw error;
    }
  }
} 