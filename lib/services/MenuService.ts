import { supabase } from '../supabase/config';

export interface MenuCategory {
  id: number;
  name: string;
  description: string | null;
  business_id: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category_id: number;
  business_id: number;
  is_popular: boolean;
  is_available: boolean;
  allergens: any[];
  nutritional_info: any;
  preparation_time: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItemWithCategory extends MenuItem {
  category: MenuCategory;
}

export class MenuService {
  /**
   * Récupère les catégories de menu d'un commerce
   */
  static async getMenuCategories(businessId: number): Promise<MenuCategory[]> {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des catégories de menu:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getMenuCategories:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les articles de menu d'un commerce
   */
  static async getMenuItems(businessId: number): Promise<MenuItemWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(*)
        `)
        .eq('business_id', businessId)
        .eq('is_available', true)
        .order('sort_order')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des articles de menu:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getMenuItems:', error);
      throw error;
    }
  }

  /**
   * Récupère les articles de menu d'une catégorie spécifique
   */
  static async getMenuItemsByCategory(businessId: number, categoryId: number): Promise<MenuItemWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(*)
        `)
        .eq('business_id', businessId)
        .eq('category_id', categoryId)
        .eq('is_available', true)
        .order('sort_order')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des articles de menu par catégorie:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getMenuItemsByCategory:', error);
      throw error;
    }
  }

  /**
   * Récupère un article de menu spécifique
   */
  static async getMenuItem(itemId: number): Promise<MenuItemWithCategory | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(*)
        `)
        .eq('id', itemId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'article de menu:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans getMenuItem:', error);
      throw error;
    }
  }

  /**
   * Recherche d'articles de menu
   */
  static async searchMenuItems(query: string): Promise<MenuItemWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(*)
        `)
        .eq('is_available', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name');

      if (error) {
        console.error('Erreur lors de la recherche d\'articles de menu:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans searchMenuItems:', error);
      throw error;
    }
  }

  /**
   * Récupère les articles populaires d'un commerce
   */
  static async getPopularMenuItems(businessId: number, limit: number = 10): Promise<MenuItemWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(*)
        `)
        .eq('business_id', businessId)
        .eq('is_popular', true)
        .eq('is_available', true)
        .order('sort_order')
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des articles populaires:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getPopularMenuItems:', error);
      throw error;
    }
  }
} 