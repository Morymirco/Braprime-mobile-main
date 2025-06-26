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

export class OrderService {
  // Récupérer les commandes d'un utilisateur
  static async getUserOrders(userId: string): Promise<{ orders: Order[]; error: string | null }> {
    try {
      console.log('📋 Récupération des commandes utilisateur:', userId);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération commandes utilisateur:', error);
        return { orders: [], error: error.message };
      }

      console.log('✅ Commandes utilisateur récupérées:', data?.length || 0);
      return { orders: data || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      return { orders: [], error: 'Erreur lors de la récupération des commandes' };
    }
  }

  // Récupérer une commande spécifique
  static async getOrderById(orderId: string): Promise<{ order: Order | null; error: string | null }> {
    try {
      console.log('🔍 Récupération de la commande:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération commande:', error);
        return { order: null, error: error.message };
      }

      console.log('✅ Commande récupérée:', data);
      return { order: data, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la commande:', error);
      return { order: null, error: 'Erreur lors de la récupération de la commande' };
    }
  }

  // Créer une nouvelle commande
  static async createOrder(orderData: CreateOrderData): Promise<{ order: Order | null; error: string | null }> {
    try {
      console.log('🛒 Création de commande:', orderData);
      
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création commande:', error);
        return { order: null, error: error.message };
      }

      console.log('✅ Commande créée avec succès:', data);

      // Créer une notification pour la nouvelle commande
      await this.createOrderNotification(data, 'confirmed');

      return { order: data, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      return { order: null, error: 'Erreur lors de la création de la commande' };
    }
  }

  // Mettre à jour une commande
  static async updateOrder(orderId: string, updates: UpdateOrderData): Promise<{ order: Order | null; error: string | null }> {
    try {
      console.log('🔄 Mise à jour de la commande:', orderId, updates);
      
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
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
  }

  // Annuler une commande
  static async cancelOrder(orderId: string): Promise<{ error: string | null }> {
    try {
      console.log('❌ Annulation de la commande:', orderId);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Erreur annulation commande:', error);
        return { error: error.message };
      }

      console.log('✅ Commande annulée avec succès');
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la commande:', error);
      return { error: 'Erreur lors de l\'annulation de la commande' };
    }
  }

  // Noter une commande
  static async rateOrder(orderId: string, rating: number, review?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('⭐ Notation de la commande:', orderId, rating);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          customer_rating: rating,
          customer_review: review,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
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
  }

  // Récupérer les commandes par statut
  static async getOrdersByStatus(status: Order['status']): Promise<{ orders: Order[]; error: string | null }> {
    try {
      console.log('📊 Récupération commandes par statut:', status);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération commandes par statut:', error);
        return { orders: [], error: error.message };
      }

      console.log('✅ Commandes par statut récupérées:', data?.length || 0);
      return { orders: data || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      return { orders: [], error: 'Erreur lors de la récupération des commandes' };
    }
  }

  // Récupérer les statistiques des commandes
  static async getOrderStats(): Promise<{ stats: any; error: string | null }> {
    try {
      // Récupérer toutes les commandes de l'utilisateur
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

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

  // Écouter les changements de commandes en temps réel
  static subscribeToOrderChanges(orderId: string, callback: (order: Order) => void) {
    console.log('👂 Abonnement aux changements de commande:', orderId);
    
    return supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('🔄 Changement de commande détecté:', payload.new);
          callback(payload.new as Order);
        }
      )
      .subscribe();
  }

  // Écouter les nouvelles commandes d'un commerce
  static subscribeToBusinessOrders(businessId: number, callback: (order: Order) => void) {
    console.log('👂 Abonnement aux nouvelles commandes commerce:', businessId);
    
    return supabase
      .channel(`business-orders-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('🆕 Nouvelle commande commerce détectée:', payload.new);
          callback(payload.new as Order);
        }
      )
      .subscribe();
  }

  // Écouter les changements de statut des commandes d'un utilisateur
  static subscribeToUserOrderStatus(userId: string, callback: (order: Order) => void) {
    console.log('👂 Abonnement aux changements de statut utilisateur:', userId);
    
    return supabase
      .channel(`user-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 Changement de statut utilisateur détecté:', payload.new);
          callback(payload.new as Order);
        }
      )
      .subscribe();
  }

  // Fonction helper pour créer des notifications selon le statut
  private static async createOrderNotification(order: Order, status: string) {
    try {
      const statusMessages = {
        'confirmed': {
          title: 'Commande confirmée',
          message: `Votre commande #${order.id.substring(0, 8)} a été confirmée par ${order.business_name}.`,
          priority: 'medium' as const
        },
        'preparing': {
          title: 'Commande en préparation',
          message: `Votre commande #${order.id.substring(0, 8)} est en cours de préparation chez ${order.business_name}.`,
          priority: 'medium' as const
        },
        'ready': {
          title: 'Commande prête',
          message: `Votre commande #${order.id.substring(0, 8)} est prête pour la livraison.`,
          priority: 'high' as const
        },
        'picked_up': {
          title: 'Commande en livraison',
          message: `Votre commande #${order.id.substring(0, 8)} est en cours de livraison.`,
          priority: 'high' as const
        },
        'delivered': {
          title: 'Commande livrée',
          message: `Votre commande #${order.id.substring(0, 8)} a été livrée. Bon appétit !`,
          priority: 'medium' as const
        },
        'cancelled': {
          title: 'Commande annulée',
          message: `Votre commande #${order.id.substring(0, 8)} a été annulée.`,
          priority: 'high' as const
        }
      };

      const notificationData = statusMessages[status as keyof typeof statusMessages];
      
      if (notificationData) {
        // Ici vous pouvez intégrer votre système de notifications
        // Pour l'instant, on log juste la notification
        console.log('📱 Notification créée:', notificationData);
        
        // Exemple d'intégration avec un service de notifications
        // await NotificationService.create({
        //   user_id: order.user_id,
        //   type: 'order_status',
        //   title: notificationData.title,
        //   message: notificationData.message,
        //   priority: notificationData.priority,
        //   data: {
        //     order_id: order.id,
        //     business_name: order.business_name,
        //     status: status
        //   }
        // });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la notification:', error);
    }
  }
} 