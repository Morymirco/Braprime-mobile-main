import { useEffect, useState } from 'react';
import { BusinessService, BusinessWithType } from '../lib/services/BusinessService';

interface UseBusinessesReturn {
  businesses: BusinessWithType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinesses(): UseBusinessesReturn {
  const [businesses, setBusinesses] = useState<BusinessWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BusinessService.getAllBusinesses();
      setBusinesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des commerces');
      console.error('Erreur dans useBusinesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinesses,
  };
}

interface UseBusinessesByTypeReturn {
  businesses: BusinessWithType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessesByType(businessTypeId: number): UseBusinessesByTypeReturn {
  const [businesses, setBusinesses] = useState<BusinessWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessesByType = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BusinessService.getBusinessesByType(businessTypeId);
      setBusinesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des commerces');
      console.error('Erreur dans useBusinessesByType:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessTypeId) {
      fetchBusinessesByType();
    }
  }, [businessTypeId]);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinessesByType,
  };
}

interface UseBusinessesByTypeNameReturn {
  businesses: BusinessWithType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessesByTypeName(typeName: string): UseBusinessesByTypeNameReturn {
  const [businesses, setBusinesses] = useState<BusinessWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessesByTypeName = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BusinessService.getBusinessesByTypeName(typeName);
      setBusinesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des commerces');
      console.error('Erreur dans useBusinessesByTypeName:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeName) {
      fetchBusinessesByTypeName();
    }
  }, [typeName]);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinessesByTypeName,
  };
}

interface UseBusinessSearchReturn {
  businesses: BusinessWithType[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
}

export function useBusinessSearch(): UseBusinessSearchReturn {
  const [businesses, setBusinesses] = useState<BusinessWithType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setBusinesses([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await BusinessService.searchBusinesses(query);
      setBusinesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      console.error('Erreur dans useBusinessSearch:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    businesses,
    loading,
    error,
    search,
  };
}

interface UseGlobalSearchReturn {
  businesses: BusinessWithType[];
  menuItems: any[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [businesses, setBusinesses] = useState<BusinessWithType[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      clearResults();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Début de la recherche globale pour:', query);
      
      const results = await BusinessService.globalSearch(query);
      
      console.log('📊 Résultats de recherche:', {
        businesses: results.businesses.length,
        menuItems: results.menuItems.length
      });
      
      setBusinesses(results.businesses);
      setMenuItems(results.menuItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      console.error('❌ Erreur dans useGlobalSearch:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setBusinesses([]);
    setMenuItems([]);
    setError(null);
  };

  return {
    businesses,
    menuItems,
    loading,
    error,
    search,
    clearResults,
  };
} 