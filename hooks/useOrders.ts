import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { orderService, type Order, type OrderData, type PaymentMethod } from '../lib/services/OrderService';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: any;
  createOrder: (orderData: OrderData) => Promise<{ success: boolean; orderId?: string; error?: any }>;
  cancelOrder: (orderId: string) => Promise<{ success: boolean; error?: any }>;
  rateOrder: (orderId: string, rating: number, review?: string) => Promise<{ success: boolean; error?: any }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<{ success: boolean; error?: any }>;
  getPaymentMethods: () => Promise<{ methods: PaymentMethod[]; error?: any }>;
  refreshOrders: () => Promise<void>;
  getOrdersByStatus: (status: Order['status']) => Promise<{ orders: Order[]; error?: any }>;
}

export function useOrders(): UseOrdersReturn {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Charger les commandes au montage et quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      loadUserOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user?.id]);

  const loadUserOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 DEBUG - Chargement des commandes pour utilisateur:', user.id);
      
      const { orders: userOrders, error: ordersError } = await orderService.getUserOrders(user.id);
      
      console.log('🔍 DEBUG - Réponse du service:', { userOrders, ordersError });
      console.log('🔍 DEBUG - Nombre de commandes reçues:', userOrders?.length || 0);
      
      if (ordersError) {
        console.error('❌ Erreur lors du chargement des commandes:', ordersError);
        setError(ordersError);
        return;
      }

      setOrders(userOrders);
      console.log('🔍 DEBUG - Commandes définies dans l\'état:', userOrders?.length || 0);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des commandes:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: OrderData): Promise<{ success: boolean; orderId?: string; error?: any }> => {
    try {
      setError(null);
      
      const { orderId, error: createError } = await orderService.createOrder(orderData);
      
      if (createError) {
        setError(createError);
        return { success: false, error: createError };
      }

      if (orderId) {
        // Recharger les commandes pour inclure la nouvelle
        await loadUserOrders();
        return { success: true, orderId };
      }

      return { success: false, error: 'Erreur lors de la création de la commande' };
    } catch (err) {
      console.error('❌ Erreur lors de la création de la commande:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const cancelOrder = async (orderId: string): Promise<{ success: boolean; error?: any }> => {
    try {
      setError(null);
      
      const { success, error: cancelError } = await orderService.cancelOrder(orderId);
      
      if (cancelError) {
        setError(cancelError);
        return { success: false, error: cancelError };
      }

      if (success) {
        // Mettre à jour la liste des commandes
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' as const }
              : order
          )
        );
      }

      return { success };
    } catch (err) {
      console.error('❌ Erreur lors de l\'annulation de la commande:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const rateOrder = async (orderId: string, rating: number, review?: string): Promise<{ success: boolean; error?: any }> => {
    try {
      setError(null);
      
      const { success, error: rateError } = await orderService.rateOrder(orderId, rating, review);
      
      if (rateError) {
        setError(rateError);
        return { success: false, error: rateError };
      }

      if (success) {
        // Mettre à jour la commande dans la liste
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, customer_rating: rating, customer_review: review }
              : order
          )
        );
      }

      return { success };
    } catch (err) {
      console.error('❌ Erreur lors de la notation de la commande:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<{ success: boolean; error?: any }> => {
    try {
      setError(null);
      
      const { success, error: updateError } = await orderService.updateOrderStatus(orderId, status);
      
      if (updateError) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      if (success) {
        // Mettre à jour la commande dans la liste
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status }
              : order
          )
        );
      }

      return { success };
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du statut:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const getPaymentMethods = async (): Promise<{ methods: PaymentMethod[]; error?: any }> => {
    try {
      const { methods, error: methodsError } = await orderService.getPaymentMethods();
      
      if (methodsError) {
        return { methods: [], error: methodsError };
      }

      return { methods };
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des méthodes de paiement:', err);
      return { methods: [], error: err };
    }
  };

  const refreshOrders = async (): Promise<void> => {
    await loadUserOrders();
  };

  const getOrdersByStatus = async (status: Order['status']): Promise<{ orders: Order[]; error?: any }> => {
    if (!user?.id) {
      return { orders: [], error: 'Utilisateur non connecté' };
    }

    try {
      const { orders: statusOrders, error: statusError } = await orderService.getOrdersByStatus(user.id, status);
      
      if (statusError) {
        return { orders: [], error: statusError };
      }

      return { orders: statusOrders };
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des commandes par statut:', err);
      return { orders: [], error: err };
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    cancelOrder,
    rateOrder,
    updateOrderStatus,
    getPaymentMethods,
    refreshOrders,
    getOrdersByStatus,
  };
} 