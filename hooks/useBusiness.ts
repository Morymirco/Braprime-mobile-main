import { useEffect, useState } from 'react';
import { BusinessService, BusinessWithType } from '../lib/services/BusinessService';

interface UseBusinessReturn {
  business: BusinessWithType | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusiness(id: number | string | null | undefined): UseBusinessReturn {
  const [business, setBusiness] = useState<BusinessWithType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = async () => {
    // Debug logging
    console.log('🔍 useBusiness - Input ID:', id, 'Type:', typeof id);
    
    // Validate that id exists and is a valid number
    if (!id || id === 'undefined' || id === 'null' || id === '' || id === 'NaN') {
      console.log('❌ useBusiness - Invalid ID (null/undefined/empty/NaN):', id);
      setError('ID de commerce invalide');
      setLoading(false);
      return;
    }

    // Try to parse the ID, handle various formats
    let businessId: number;
    if (typeof id === 'number') {
      businessId = id;
    } else if (typeof id === 'string') {
      businessId = parseInt(id.trim());
    } else {
      businessId = parseInt(String(id));
    }
    
    console.log('🔍 useBusiness - Parsed ID:', businessId, 'isNaN:', isNaN(businessId));
    
    if (isNaN(businessId) || businessId <= 0) {
      console.log('❌ useBusiness - Invalid parsed ID:', businessId);
      setError('ID de commerce invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('✅ useBusiness - Fetching business with ID:', businessId);
      const data = await BusinessService.getBusinessById(businessId);
      setBusiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du commerce');
      console.error('Erreur dans useBusiness:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  return {
    business,
    loading,
    error,
    refetch: fetchBusiness,
  };
} 