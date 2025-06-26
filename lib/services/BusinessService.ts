import { supabase } from '../supabase/config';

export interface Business {
  id: number;
  name: string;
  description: string | null;
  business_type_id: number;
  category_id: number | null;
  cover_image: string | null;
  logo: string | null;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: number;
  address: string;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  cuisine_type: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  is_open: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessWithType extends Business {
  business_type: {
    id: number;
    name: string;
    icon: string;
    color: string;
    image_url: string | null;
  };
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
}

export class BusinessService {
  /**
   * Récupère tous les commerces
   */
  static async getAllBusinesses(): Promise<BusinessWithType[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des commerces:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getAllBusinesses:', error);
      throw error;
    }
  }

  /**
   * Récupère les commerces par type
   */
  static async getBusinessesByType(businessTypeId: number): Promise<BusinessWithType[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('business_type_id', businessTypeId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des commerces par type:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getBusinessesByType:', error);
      throw error;
    }
  }

  /**
   * Récupère les commerces par nom de type
   */
  static async getBusinessesByTypeName(typeName: string): Promise<BusinessWithType[]> {
    try {
      // First, get the business type ID by name
      const { data: businessType, error: typeError } = await supabase
        .from('business_types')
        .select('id')
        .eq('name', typeName)
        .single();

      if (typeError) {
        console.error('Erreur lors de la récupération du type de commerce:', typeError);
        throw typeError;
      }

      if (!businessType) {
        console.log('❌ Type de commerce non trouvé:', typeName);
        return [];
      }

      console.log('🔍 Found business type ID:', businessType.id);

      // Then get businesses by the type ID
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('business_type_id', businessType.id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des commerces par nom de type:', error);
        throw error;
      }

      console.log('🔍 getBusinessesByTypeName - Found businesses:', data?.length || 0);
      if (data) {
        data.forEach((business, index) => {
          console.log(`  Business ${index + 1}:`, {
            id: business.id,
            idType: typeof business.id,
            name: business.name,
            businessType: business.business_type?.name
          });
        });
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getBusinessesByTypeName:', error);
      throw error;
    }
  }

  /**
   * Récupère un commerce par son ID
   */
  static async getBusinessById(id: number): Promise<BusinessWithType | null> {
    try {
      // Validate ID
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('ID de commerce invalide');
      }

      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du commerce:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans getBusinessById:', error);
      throw error;
    }
  }

  /**
   * Recherche de commerces
   */
  static async searchBusinesses(query: string): Promise<BusinessWithType[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name');

      if (error) {
        console.error('Erreur lors de la recherche de commerces:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans searchBusinesses:', error);
      throw error;
    }
  }

  /**
   * Récupère les commerces ouverts
   */
  static async getOpenBusinesses(): Promise<BusinessWithType[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('is_active', true)
        .eq('is_open', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des commerces ouverts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getOpenBusinesses:', error);
      throw error;
    }
  }

  /**
   * Récupère les commerces populaires (par note)
   */
  static async getPopularBusinesses(limit: number = 10): Promise<BusinessWithType[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des commerces populaires:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getPopularBusinesses:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des commerces
   */
  static async getBusinessStats(): Promise<{
    total: number;
    open: number;
    byType: { [key: string]: number };
  }> {
    try {
      const { data: allBusinesses, error } = await supabase
        .from('businesses')
        .select('id, is_open, business_type_id, business_type:business_types(name)')
        .eq('is_active', true);

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
      }

      const total = allBusinesses?.length || 0;
      const open = allBusinesses?.filter(b => b.is_open).length || 0;
      
      const byType: { [key: string]: number } = {};
      allBusinesses?.forEach(business => {
        const typeName = (business as any).business_type?.name || 'unknown';
        byType[typeName] = (byType[typeName] || 0) + 1;
      });

      return { total, open, byType };
    } catch (error) {
      console.error('Erreur dans getBusinessStats:', error);
      throw error;
    }
  }

  /**
   * Recherche d'éléments de menu
   */
  static async searchMenuItems(query: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          business:businesses(id, name, business_type_id, cover_image, logo)
        `)
        .eq('is_available', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name')
        .limit(50);

      if (error) {
        console.error('Erreur lors de la recherche d\'éléments de menu:', error);
        throw error;
      }

      console.log('Résultats de recherche menu:', data?.length || 0, 'éléments trouvés');
      return data || [];
    } catch (error) {
      console.error('Erreur dans searchMenuItems:', error);
      throw error;
    }
  }

  /**
   * Recherche globale (commerces + éléments de menu)
   */
  static async globalSearch(query: string): Promise<{
    businesses: BusinessWithType[];
    menuItems: any[];
  }> {
    try {
      const [businesses, menuItems] = await Promise.all([
        this.searchBusinesses(query),
        this.searchMenuItems(query)
      ]);

      return {
        businesses,
        menuItems
      };
    } catch (error) {
      console.error('Erreur dans globalSearch:', error);
      throw error;
    }
  }
} 