import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { useToast } from '../lib/contexts/ToastContext';
import { PackageOrderService } from '../lib/services/PackageOrderService';

export interface PackageOrder {
  id: string;
  business_id: number;
  order_type: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_instructions?: string;
  scheduled_date: string;
  scheduled_time: string;
  preferred_delivery_time: string;
  contact_method: string;
  metadata: {
    service_name: string;
    service_price: number;
    package_count: number;
    delivery_preferences: any;
    is_multi_package: boolean;
  };
  created_at: string;
  updated_at: string;
  order_items: Array<{
    id: string;
    item_name: string;
    item_description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    metadata: {
      package_type: string;
      weight: string;
      dimensions: string;
      is_fragile: boolean;
      is_urgent: boolean;
      delivery_address: {
        address: string;
        instructions?: string;
      };
      customer_info: {
        name: string;
        phone: string;
        email: string;
      };
      package_index: number;
    };
  }>;
  businesses: {
    id: number;
    name: string;
    image_url?: string;
    business_type: {
      name: string;
      icon?: string;
      color?: string;
    };
  };
}

export const usePackageOrders = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPackageOrders = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const packageOrders = await PackageOrderService.getUserPackageOrders();
      setOrders(packageOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des commandes';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  const getPackageOrderDetails = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const orderDetails = await PackageOrderService.getPackageOrderDetails(orderId);
      return orderDetails;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des détails';
      setError(errorMessage);
      showToast('error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createPackageOrder = useCallback(async (orderData: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await PackageOrderService.createMultiPackageOrder(orderData);
      
      if (result.success) {
        showToast('success', 'Commande de colis créée avec succès');
        // Recharger la liste des commandes
        await loadPackageOrders();
        return result;
      } else {
        throw new Error(result.error || 'Erreur lors de la création de la commande');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la commande';
      setError(errorMessage);
      showToast('error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast, loadPackageOrders]);

  const refreshOrders = useCallback(() => {
    loadPackageOrders();
  }, [loadPackageOrders]);

  useEffect(() => {
    if (user) {
      loadPackageOrders();
    }
  }, [user, loadPackageOrders]);

  return {
    orders,
    loading,
    error,
    loadPackageOrders,
    getPackageOrderDetails,
    createPackageOrder,
    refreshOrders,
  };
};
