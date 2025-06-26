import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { Order, OrderService } from '../lib/services/OrderService';
import { useDataSync } from './useDataSync';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getOrderById: (orderId: string) => Promise<{ order: Order | null; error: string | null }>;
  cancelOrder: (orderId: string) => Promise<{ error: string | null }>;
  rateOrder: (orderId: string, rating: number, review?: string) => Promise<{ success: boolean; error: string | null }>;
}

export function useOrders(): UseOrdersReturn {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Système de synchronisation
  const { registerSync, unregisterSync } = useDataSync({
    enabled: true,
    interval: 30000, // 30 secondes
    retryAttempts: 3,
    retryDelay: 5000,
  });

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Récupération des commandes...');
      const { orders: ordersData, error: ordersError } = await OrderService.getUserOrders(user.id);
      
      if (ordersError) {
        setError(ordersError);
        console.error('❌ Erreur commandes:', ordersError);
      } else {
        setOrders(ordersData);
        console.log('✅ Commandes récupérées:', ordersData.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des commandes';
      setError(errorMessage);
      console.error('❌ Erreur dans fetchOrders:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getOrderById = useCallback(async (orderId: string) => {
    if (!user?.id) {
      return { order: null, error: 'Utilisateur non connecté' };
    }

    try {
      console.log('🔍 Récupération de la commande:', orderId);
      const result = await OrderService.getOrderById(orderId);
      
      if (result.order && result.order.user_id !== user.id) {
        return { order: null, error: 'Accès non autorisé' };
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de la commande';
      console.error('❌ Erreur dans getOrderById:', err);
      return { order: null, error: errorMessage };
    }
  }, [user?.id]);

  const cancelOrder = useCallback(async (orderId: string) => {
    if (!user?.id) {
      return { error: 'Utilisateur non connecté' };
    }

    try {
      console.log('❌ Annulation de la commande:', orderId);
      
      // Vérifier que la commande appartient à l'utilisateur
      const { order } = await OrderService.getOrderById(orderId);
      if (!order || order.user_id !== user.id) {
        return { error: 'Accès non autorisé' };
      }

      // Vérifier que la commande peut être annulée
      if (!['pending', 'confirmed'].includes(order.status)) {
        return { error: 'Cette commande ne peut plus être annulée' };
      }

      const result = await OrderService.cancelOrder(orderId);
      
      if (!result.error) {
        // Mettre à jour la liste des commandes
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' as const }
              : order
          )
        );
        console.log('✅ Commande annulée avec succès');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      console.error('❌ Erreur dans cancelOrder:', err);
      return { error: errorMessage };
    }
  }, [user?.id]);

  const rateOrder = useCallback(async (orderId: string, rating: number, review?: string) => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: 'La note doit être entre 1 et 5' };
    }

    try {
      console.log('⭐ Notation de la commande:', orderId, rating);
      
      // Vérifier que la commande appartient à l'utilisateur
      const { order } = await OrderService.getOrderById(orderId);
      if (!order || order.user_id !== user.id) {
        return { success: false, error: 'Accès non autorisé' };
      }

      // Vérifier que la commande est livrée
      if (order.status !== 'delivered') {
        return { success: false, error: 'Seules les commandes livrées peuvent être notées' };
      }

      const result = await OrderService.addCustomerReview(orderId, rating, review);
      
      if (!result.error) {
        // Mettre à jour la liste des commandes
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, customer_rating: rating, customer_review: review }
              : order
          )
        );
        console.log('✅ Commande notée avec succès');
      }
      
      return { success: !result.error, error: result.error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la notation';
      console.error('❌ Erreur dans rateOrder:', err);
      return { success: false, error: errorMessage };
    }
  }, [user?.id]);

  // Synchronisation automatique
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Enregistrement de la synchronisation des commandes
  useEffect(() => {
    if (user?.id) {
      registerSync('orders-sync', fetchOrders, 'medium');
      
      return () => {
        unregisterSync('orders-sync');
      };
    }
  }, [user?.id, registerSync, unregisterSync, fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    getOrderById,
    cancelOrder,
    rateOrder,
  };
} 