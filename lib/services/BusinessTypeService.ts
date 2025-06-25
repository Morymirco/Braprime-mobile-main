import { supabase } from '../supabase/config';

export interface BusinessType {
  id: number;
  name: string;
  icon: string;
  color: string;
  image_url: string | null;
  description: string | null;
  features: string[];
  created_at: string;
  updated_at: string;
}

export class BusinessTypeService {
  /**
   * Récupère tous les types de commerce
   */
  static async getAllBusinessTypes(): Promise<BusinessType[]> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des types de commerce:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getAllBusinessTypes:', error);
      throw error;
    }
  }

  /**
   * Récupère un type de commerce par son ID
   */
  static async getBusinessTypeById(id: number): Promise<BusinessType | null> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du type de commerce:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans getBusinessTypeById:', error);
      throw error;
    }
  }

  /**
   * Récupère un type de commerce par son nom
   */
  static async getBusinessTypeByName(name: string): Promise<BusinessType | null> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du type de commerce par nom:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans getBusinessTypeByName:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau type de commerce
   */
  static async createBusinessType(businessType: Omit<BusinessType, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessType> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .insert([businessType])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du type de commerce:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans createBusinessType:', error);
      throw error;
    }
  }

  /**
   * Met à jour un type de commerce
   */
  static async updateBusinessType(id: number, updates: Partial<BusinessType>): Promise<BusinessType> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du type de commerce:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans updateBusinessType:', error);
      throw error;
    }
  }

  /**
   * Supprime un type de commerce
   */
  static async deleteBusinessType(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du type de commerce:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deleteBusinessType:', error);
      throw error;
    }
  }

  /**
   * Récupère les types de commerce avec le nombre de commerces associés
   */
  static async getBusinessTypesWithCount(): Promise<(BusinessType & { business_count: number })[]> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select(`
          *,
          businesses:businesses(count)
        `)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des types de commerce avec comptage:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        business_count: item.businesses?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Erreur dans getBusinessTypesWithCount:', error);
      throw error;
    }
  }
} 