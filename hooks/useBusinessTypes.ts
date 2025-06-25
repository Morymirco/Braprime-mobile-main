import { useEffect, useState } from 'react';
import { BusinessType, BusinessTypeService } from '../lib/services/BusinessTypeService';

interface UseBusinessTypesReturn {
  businessTypes: BusinessType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessTypes(): UseBusinessTypesReturn {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BusinessTypeService.getAllBusinessTypes();
      setBusinessTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des types de commerce');
      console.error('Erreur dans useBusinessTypes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  return {
    businessTypes,
    loading,
    error,
    refetch: fetchBusinessTypes,
  };
}

interface UseBusinessTypeByIdReturn {
  businessType: BusinessType | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessTypeById(id: number): UseBusinessTypeByIdReturn {
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessType = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BusinessTypeService.getBusinessTypeById(id);
      setBusinessType(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du type de commerce');
      console.error('Erreur dans useBusinessTypeById:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBusinessType();
    }
  }, [id]);

  return {
    businessType,
    loading,
    error,
    refetch: fetchBusinessType,
  };
}

interface UseBusinessTypesWithCountReturn {
  businessTypesWithCount: (BusinessType & { business_count: number })[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessTypesWithCount(): UseBusinessTypesWithCountReturn {
  const [businessTypesWithCount, setBusinessTypesWithCount] = useState<(BusinessType & { business_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessTypesWithCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BusinessTypeService.getBusinessTypesWithCount();
      setBusinessTypesWithCount(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des types de commerce avec comptage');
      console.error('Erreur dans useBusinessTypesWithCount:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessTypesWithCount();
  }, []);

  return {
    businessTypesWithCount,
    loading,
    error,
    refetch: fetchBusinessTypesWithCount,
  };
} 