import { useEffect, useState } from 'react';
import { Order, OrderService } from '../lib/services/OrderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { orders: fetchedOrders, error: fetchError } = await OrderService.getUserOrders();

      if (fetchError) {
        setError(fetchError);
        setOrders([]);
      } else {
        setOrders(fetchedOrders);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      setLoading(true);
      setError(null);

      const { order, error: createError } = await OrderService.createOrder(orderData);

      if (createError) {
        setError(createError);
        return { success: false, error: createError };
      }

      // Ajouter la nouvelle commande à la liste
      if (order) {
        setOrders(prevOrders => [order, ...prevOrders]);
      }

      return { success: true, order };
    } catch (err) {
      const errorMessage = 'Erreur lors de la création de la commande';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId: string, updates: any) => {
    try {
      setError(null);

      const { order, error: updateError } = await OrderService.updateOrder(orderId, updates);

      if (updateError) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      // Mettre à jour la commande dans la liste
      if (order) {
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? order : o)
        );
      }

      return { success: true, order };
    } catch (err) {
      const errorMessage = 'Erreur lors de la mise à jour de la commande';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setError(null);

      const { success, error: cancelError } = await OrderService.cancelOrder(orderId);

      if (cancelError) {
        setError(cancelError);
        return { success: false, error: cancelError };
      }

      if (success) {
        // Mettre à jour le statut de la commande dans la liste
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
        );
      }

      return { success };
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'annulation de la commande';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const rateOrder = async (orderId: string, rating: number, review?: string) => {
    try {
      setError(null);

      const { success, error: rateError } = await OrderService.rateOrder(orderId, rating, review);

      if (rateError) {
        setError(rateError);
        return { success: false, error: rateError };
      }

      if (success) {
        // Mettre à jour la note de la commande dans la liste
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, customer_rating: rating, customer_review: review } : o)
        );
      }

      return { success };
    } catch (err) {
      const errorMessage = 'Erreur lors de la notation de la commande';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getOrdersByStatus = async (status: Order['status']) => {
    try {
      setLoading(true);
      setError(null);

      const { orders: statusOrders, error: statusError } = await OrderService.getOrdersByStatus(status);

      if (statusError) {
        setError(statusError);
        return { orders: [], error: statusError };
      }

      return { orders: statusOrders, error: null };
    } catch (err) {
      const errorMessage = 'Erreur lors de la récupération des commandes';
      setError(errorMessage);
      return { orders: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getOrderStats = async () => {
    try {
      setError(null);

      const { stats, error: statsError } = await OrderService.getOrderStats();

      if (statsError) {
        setError(statsError);
        return { stats: null, error: statsError };
      }

      return { stats, error: null };
    } catch (err) {
      const errorMessage = 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      return { stats: null, error: errorMessage };
    }
  };

  // Charger les commandes au montage du composant
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    cancelOrder,
    rateOrder,
    getOrdersByStatus,
    getOrderStats
  };
}; 