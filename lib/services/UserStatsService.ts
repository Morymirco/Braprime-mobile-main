import { supabase } from '../supabase/config';

export interface UserStats {
  orders: number;
  reservations: number;
  favorites: number;
  packages: number;
}

export class UserStatsService {
  /**
   * Récupère toutes les statistiques d'un utilisateur
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      console.log('🔄 Chargement des statistiques pour l\'utilisateur:', userId);

      // Récupérer les statistiques en parallèle pour optimiser les performances
      const [ordersCount, reservationsCount, favoritesCount, packagesCount] = await Promise.all([
        this.getUserOrdersCount(userId),
        this.getUserReservationsCount(userId),
        this.getUserFavoritesCount(userId),
        this.getUserPackagesCount(userId)
      ]);

      const stats: UserStats = {
        orders: ordersCount,
        reservations: reservationsCount,
        favorites: favoritesCount,
        packages: packagesCount
      };

      console.log('✅ Statistiques chargées avec succès:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
      throw new Error('Impossible de charger les statistiques utilisateur');
    }
  }

  /**
   * Compte le nombre de commandes d'un utilisateur (excluant les commandes de colis)
   */
  static async getUserOrdersCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('delivery_instructions', 'like', 'Service de colis:%');

      if (error) {
        console.error('❌ Erreur lors du comptage des commandes:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Erreur lors du comptage des commandes:', error);
      return 0;
    }
  }

  /**
   * Compte le nombre de réservations d'un utilisateur
   */
  static async getUserReservationsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erreur lors du comptage des réservations:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Erreur lors du comptage des réservations:', error);
      return 0;
    }
  }

  /**
   * Compte le nombre de colis d'un utilisateur
   */
  static async getUserPackagesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('package_orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erreur lors du comptage des colis:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Erreur lors du comptage des colis:', error);
      return 0;
    }
  }

  /**
   * Compte le nombre de favoris d'un utilisateur (commerces + articles)
   */
  static async getUserFavoritesCount(userId: string): Promise<number> {
    try {
      // Compter les commerces favoris
      const { count: businessesCount, error: businessesError } = await supabase
        .from('favorite_businesses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (businessesError) {
        console.error('❌ Erreur lors du comptage des commerces favoris:', businessesError);
      }

      // Compter les articles favoris
      const { count: menuItemsCount, error: menuItemsError } = await supabase
        .from('favorite_menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (menuItemsError) {
        console.error('❌ Erreur lors du comptage des articles favoris:', menuItemsError);
      }

      const totalFavorites = (businessesCount || 0) + (menuItemsCount || 0);
      
      console.log('📊 Détail des favoris:', {
        commerces: businessesCount || 0,
        articles: menuItemsCount || 0,
        total: totalFavorites
      });

      return totalFavorites;
    } catch (error) {
      console.error('❌ Erreur lors du comptage des favoris:', error);
      return 0;
    }
  }

  /**
   * Met en cache les statistiques pour éviter les appels répétés
   */
  private static cache = new Map<string, { stats: UserStats; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getUserStatsWithCache(userId: string): Promise<UserStats> {
    const now = Date.now();
    const cached = this.cache.get(userId);

    // Vérifier si le cache est encore valide
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📦 Statistiques récupérées depuis le cache');
      return cached.stats;
    }

    // Récupérer les nouvelles données
    const stats = await this.getUserStats(userId);
    
    // Mettre en cache
    this.cache.set(userId, { stats, timestamp: now });
    
    return stats;
  }

  /**
   * Vide le cache pour forcer un rechargement
   */
  static clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
    console.log('🗑️ Cache des statistiques vidé');
  }
}
