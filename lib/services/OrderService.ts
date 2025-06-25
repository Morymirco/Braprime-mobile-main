import { supabase } from '../supabase/config';

export interface Order {
  id: string;
  user_id: string;
  business_id: number;
  business_name: string;
  items: any[]; // JSONB des articles commandés
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  tax: number;
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
  payment_status: 'pending' | 'paid' | 'failed';
  estimated_delivery?: string;
  actual_delivery?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_location?: any;
  customer_rating?: number;
  customer_review?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  business_id: number;
  business_name: string;
  items: any[];
  total: number;
  delivery_fee: number;
  tax: number;
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
}

export interface UpdateOrderData {
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  delivery_address?: string;
  delivery_instructions?: string;
  customer_rating?: number;
  customer_review?: string;
}

export const OrderService = {
  // Récupérer les commandes d'un utilisateur
  getUserOrders: async (): Promise<{ orders: Order[]; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { orders: [], error: 'Utilisateur non authentifié' };
      }

      console.log('🔍 Récupération des commandes pour l\'utilisateur:', user.id);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes:', error);
        return { orders: [], error: error.message };
      }

      console.log('✅ Commandes récupérées:', data?.length || 0);
      return { orders: data || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      return { orders: [], error: 'Erreur lors de la récupération des commandes' };
    }
  },

  // Récupérer une commande spécifique
  getOrderById: async (orderId: string): Promise<{ order: Order | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { order: null, error: 'Utilisateur non authentifié' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération de la commande:', error);
        return { order: null, error: error.message };
      }

      return { order: data, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la commande:', error);
      return { order: null, error: 'Erreur lors de la récupération de la commande' };
    }
  },

  // Créer une nouvelle commande
  createOrder: async (orderData: CreateOrderData): Promise<{ order: Order | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { order: null, error: 'Utilisateur non authentifié' };
      }

      console.log('🚀 Création d\'une nouvelle commande:', orderData);

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          ...orderData,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de la commande:', error);
        return { order: null, error: error.message };
      }

      console.log('✅ Commande créée avec succès:', data);
      return { order: data, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      return { order: null, error: 'Erreur lors de la création de la commande' };
    }
  },

  // Mettre à jour une commande
  updateOrder: async (orderId: string, updates: UpdateOrderData): Promise<{ order: Order | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { order: null, error: 'Utilisateur non authentifié' };
      }

      console.log('🔄 Mise à jour de la commande:', orderId, updates);

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour de la commande:', error);
        return { order: null, error: error.message };
      }

      console.log('✅ Commande mise à jour avec succès:', data);
      return { order: data, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la commande:', error);
      return { order: null, error: 'Erreur lors de la mise à jour de la commande' };
    }
  },

  // Annuler une commande
  cancelOrder: async (orderId: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      console.log('❌ Annulation de la commande:', orderId);

      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed']); // Seulement si la commande peut être annulée

      if (error) {
        console.error('❌ Erreur lors de l\'annulation de la commande:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Commande annulée avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la commande:', error);
      return { success: false, error: 'Erreur lors de l\'annulation de la commande' };
    }
  },

  // Noter une commande
  rateOrder: async (orderId: string, rating: number, review?: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      if (rating < 1 || rating > 5) {
        return { success: false, error: 'La note doit être entre 1 et 5' };
      }

      console.log('⭐ Notation de la commande:', orderId, rating);

      const updateData: any = { customer_rating: rating };
      if (review) {
        updateData.customer_review = review;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .eq('status', 'delivered'); // Seulement les commandes livrées peuvent être notées

      if (error) {
        console.error('❌ Erreur lors de la notation de la commande:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Commande notée avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la notation de la commande:', error);
      return { success: false, error: 'Erreur lors de la notation de la commande' };
    }
  },

  // Récupérer les commandes par statut
  getOrdersByStatus: async (status: Order['status']): Promise<{ orders: Order[]; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { orders: [], error: 'Utilisateur non authentifié' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes par statut:', error);
        return { orders: [], error: error.message };
      }

      return { orders: data || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes par statut:', error);
      return { orders: [], error: 'Erreur lors de la récupération des commandes' };
    }
  },

  // Récupérer les statistiques des commandes
  getOrderStats: async (): Promise<{ stats: any; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { stats: null, error: 'Utilisateur non authentifié' };
      }

      // Récupérer toutes les commandes de l'utilisateur
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erreur lors de la récupération des statistiques:', error);
        return { stats: null, error: error.message };
      }

      // Calculer les statistiques
      const stats = {
        total: orders?.length || 0,
        totalSpent: orders?.reduce((sum, order) => sum + order.grand_total, 0) || 0,
        pending: orders?.filter(order => order.status === 'pending').length || 0,
        confirmed: orders?.filter(order => order.status === 'confirmed').length || 0,
        preparing: orders?.filter(order => order.status === 'preparing').length || 0,
        delivering: orders?.filter(order => order.status === 'picked_up').length || 0,
        delivered: orders?.filter(order => order.status === 'delivered').length || 0,
        cancelled: orders?.filter(order => order.status === 'cancelled').length || 0,
        averageRating: orders?.filter(order => order.customer_rating)
          .reduce((sum, order) => sum + order.customer_rating!, 0) / 
          (orders?.filter(order => order.customer_rating).length || 1) || 0
      };

      return { stats, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return { stats: null, error: 'Erreur lors de la récupération des statistiques' };
    }
  }
}; 