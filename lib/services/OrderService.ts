import { supabase } from '../supabase/config';

// Types adaptés au schéma de base de données
export interface CartItem {
  id: string;
  menu_item_id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
}

export interface Order {
  id: string;
  user_id: string;
  business_id?: number;
  business_name: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  tax: number;
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: 'cash' | 'orange_money' | 'mtn_money' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  estimated_delivery?: string;
  actual_delivery?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_location?: any;
  customer_rating?: number;
  customer_review?: string;
  pickup_coordinates?: { latitude: number; longitude: number };
  delivery_coordinates?: { latitude: number; longitude: number };
  estimated_pickup_time?: string;
  estimated_delivery_time?: string;
  actual_pickup_time?: string;
  actual_delivery_time?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderData {
  user_id: string;
  business_id?: number;
  business_name: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  tax: number;
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: 'cash' | 'orange_money' | 'mtn_money' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  pickup_coordinates?: { latitude: number; longitude: number };
  delivery_coordinates?: { latitude: number; longitude: number };
}

export interface PaymentMethod {
  id: number;
  name: string;
  icon: string;
  description?: string;
  is_available: boolean;
}

class OrderService {
  // Récupérer toutes les commandes d'un utilisateur
  async getUserOrders(userId: string): Promise<{ orders: Order[]; error: any }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes:', error);
        return { orders: [], error };
      }

      return { orders: orders || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      return { orders: [], error };
    }
  }

  // Récupérer une commande spécifique
  async getOrder(orderId: string): Promise<{ order: Order | null; error: any }> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération de la commande:', error);
        return { order: null, error };
      }

      return { order, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la commande:', error);
      return { order: null, error };
    }
  }

  // Créer une nouvelle commande
  async createOrder(orderData: OrderData): Promise<{ orderId: string | null; error: any }> {
    try {
      console.log('🛒 Création de commande avec les données:', orderData);

      // Préparer les données pour l'insertion
      const orderToInsert = {
        user_id: orderData.user_id,
        business_id: orderData.business_id,
        business_name: orderData.business_name,
        items: orderData.items,
        status: orderData.status,
        total: orderData.total,
        delivery_fee: orderData.delivery_fee,
        tax: orderData.tax,
        grand_total: orderData.grand_total,
        delivery_method: orderData.delivery_method,
        delivery_address: orderData.delivery_address,
        delivery_instructions: orderData.delivery_instructions,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status,
        pickup_coordinates: orderData.pickup_coordinates,
        delivery_coordinates: orderData.delivery_coordinates,
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderToInsert])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de la commande:', error);
        return { orderId: null, error };
      }

      console.log('✅ Commande créée avec succès:', order.id);
      return { orderId: order.id, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      return { orderId: null, error };
    }
  }

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du statut:', error);
        return { success: false, error };
      }

      // Ajouter une entrée dans l'historique des statuts
      await this.addOrderStatusHistory(orderId, status);

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      return { success: false, error };
    }
  }

  // Ajouter une entrée dans l'historique des statuts
  async addOrderStatusHistory(orderId: string, status: string, description?: string): Promise<void> {
    try {
      await supabase
        .from('order_status_history')
        .insert([{
          order_id: orderId,
          status,
          description,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'historique:', error);
    }
  }

  // Récupérer les méthodes de paiement disponibles
  async getPaymentMethods(): Promise<{ methods: PaymentMethod[]; error: any }> {
    try {
      const { data: methods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_available', true)
        .order('id');

      if (error) {
        console.error('❌ Erreur lors de la récupération des méthodes de paiement:', error);
        return { methods: [], error };
      }

      return { methods: methods || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des méthodes de paiement:', error);
      return { methods: [], error };
    }
  }

  // Créer un paiement pour une commande
  async createPayment(orderId: string, amount: number, method: string): Promise<{ paymentId: string | null; error: any }> {
    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([{
          order_id: orderId,
          amount,
          method,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création du paiement:', error);
        return { paymentId: null, error };
      }

      return { paymentId: payment.id, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création du paiement:', error);
      return { paymentId: null, error };
    }
  }

  // Mettre à jour le statut d'un paiement
  async updatePaymentStatus(paymentId: string, status: 'pending' | 'paid' | 'failed', transactionId?: string): Promise<{ success: boolean; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (transactionId) {
        updateData.transaction_id = transactionId;
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du statut de paiement:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut de paiement:', error);
      return { success: false, error };
    }
  }

  // Annuler une commande
  async cancelOrder(orderId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Erreur lors de l\'annulation de la commande:', error);
        return { success: false, error };
      }

      // Ajouter l'historique
      await this.addOrderStatusHistory(orderId, 'cancelled', 'Commande annulée par l\'utilisateur');

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la commande:', error);
      return { success: false, error };
    }
  }

  // Noter une commande
  async rateOrder(orderId: string, rating: number, review?: string): Promise<{ success: boolean; error: any }> {
    try {
      if (rating < 1 || rating > 5) {
        return { success: false, error: 'La note doit être entre 1 et 5' };
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          customer_rating: rating,
          customer_review: review,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Erreur lors de la notation de la commande:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la notation de la commande:', error);
      return { success: false, error };
    }
  }

  // Récupérer les commandes par statut
  async getOrdersByStatus(userId: string, status: Order['status']): Promise<{ orders: Order[]; error: any }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes par statut:', error);
        return { orders: [], error };
      }

      return { orders: orders || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes par statut:', error);
      return { orders: [], error };
    }
  }

  // Récupérer l'historique des statuts d'une commande
  async getOrderStatusHistory(orderId: string): Promise<{ history: any[]; error: any }> {
    try {
      const { data: history, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération de l\'historique:', error);
        return { history: [], error };
      }

      return { history: history || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      return { history: [], error };
    }
  }
}

export const orderService = new OrderService();
export default orderService; 