import { supabase } from '../supabase/config';

// Types pour les livraisons groupées
export interface CreateDeliveryGroupData {
  user_id: string;
  delivery_address: string;
  delivery_instructions?: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_type: 'asap' | 'scheduled';
  payment_method: string;
  total_amount: number;
  total_delivery_fee: number;
  landmark?: string;
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  zone?: string;
  commune?: string;
  quartier?: string;
}

export interface CreateGroupedOrderData {
  user_id: string;
  business_id: number;
  delivery_group_id: string;
  group_sequence: number;
  items: {
    id: string;
    menu_item_id?: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    special_instructions?: string;
  }[];
  total: number;
  delivery_fee: number;
  service_fee: number;
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: string;
  landmark?: string;
  delivery_type?: 'asap' | 'scheduled';
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  zone?: string;
  commune?: string;
  quartier?: string;
}

export interface DeliveryGroup {
  id: string;
  user_id: string;
  delivery_address: string;
  delivery_instructions?: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_type: 'asap' | 'scheduled';
  payment_method: string;
  total_amount: number;
  total_delivery_fee: number;
  landmark?: string;
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  zone?: string;
  commune?: string;
  quartier?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  driver_id?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupedOrder {
  id: string;
  user_id: string;
  business_id: number;
  delivery_group_id: string;
  group_sequence: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  service_fee: number;
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  landmark?: string;
  delivery_type?: 'asap' | 'scheduled';
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  zone?: string;
  commune?: string;
  quartier?: string;
  created_at: string;
  updated_at: string;
}

class DeliveryGroupService {
  /**
   * Créer un groupe de livraison (approche similaire au client web)
   */
  async createDeliveryGroup(data: CreateDeliveryGroupData): Promise<{ group_id: string | null; error: any }> {
    try {
      console.log('🚚 Création du groupe de livraison:', data);

      // Générer un ID de groupe unique
      const group_id = crypto.randomUUID();
      
      // Récupérer un business_id valide
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .limit(1)
        .single();

      if (businessError || !businesses) {
        console.error('❌ Erreur récupération business:', businessError);
        return { group_id: null, error: businessError || 'Aucun business trouvé' };
      }

      // Créer une commande temporaire pour le paiement (sans RLS)
      const { error: tempOrderError } = await supabase
        .from('orders')
        .insert({
          user_id: data.user_id,
          business_id: businesses.id, // Utiliser un business_id valide
          total: data.total_amount,
          grand_total: data.total_amount,
          delivery_method: data.delivery_method,
          delivery_address: data.delivery_address,
          delivery_instructions: data.delivery_instructions,
          payment_method: data.payment_method,
          delivery_type: data.delivery_type,
          scheduled_delivery_window_start: data.scheduled_delivery_window_start,
          scheduled_delivery_window_end: data.scheduled_delivery_window_end,
          payment_status: 'pending',
          status: 'pending',
          is_grouped_delivery: true,
          delivery_group_id: group_id,
          group_sequence: 0,
          landmark: data.landmark,
          zone: data.zone,
          commune: data.commune,
          quartier: data.quartier,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (tempOrderError) {
        console.error('❌ Erreur création commande temporaire:', tempOrderError);
        return { group_id: null, error: tempOrderError };
      }
      
      // Ne pas créer de paiement ici - le backend s'en chargera
      // Le paiement sera créé lors de l'appel à PaymentService.createPayment()
      console.log('✅ Groupe de livraison créé sans paiement (sera créé par le backend)');

      return { group_id, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création du groupe de livraison:', error);
      return { group_id: null, error };
    }
  }

  /**
   * Créer une commande groupée
   */
  async createGroupedOrder(data: CreateGroupedOrderData): Promise<{ order: GroupedOrder | null; error: any }> {
    try {
      console.log('📦 Création de la commande groupée:', data);

      // Générer un numéro de commande unique
      const orderNumber = await this.generateOrderNumber();

      // Créer la commande
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          user_id: data.user_id,
          business_id: data.business_id,
          delivery_group_id: data.delivery_group_id,
          group_sequence: data.group_sequence,
          status: 'pending',
          total: data.total,
          delivery_fee: data.delivery_fee,
          service_fee: data.service_fee,
          grand_total: data.grand_total,
          delivery_method: data.delivery_method,
          delivery_address: data.delivery_address,
          delivery_instructions: data.delivery_instructions,
          payment_method: data.payment_method,
          payment_status: 'pending',
          landmark: data.landmark,
          delivery_type: data.delivery_type,
          scheduled_delivery_window_start: data.scheduled_delivery_window_start,
          scheduled_delivery_window_end: data.scheduled_delivery_window_end,
          zone: data.zone,
          commune: data.commune,
          quartier: data.quartier,
          order_number: orderNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de la commande groupée:', error);
        return { order: null, error };
      }

      // Créer les articles de commande
      if (data.items && data.items.length > 0) {
        try {
          await this.createOrderItems(order.id, data.items);
          console.log('✅ Articles de commande groupée créés avec succès');
        } catch (itemsError) {
          console.warn('⚠️ Erreur lors de la création des articles de commande groupée:', itemsError);
        }
      }

      console.log('✅ Commande groupée créée avec succès:', order.id);
      return { order, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande groupée:', error);
      return { order: null, error };
    }
  }

  /**
   * Créer les articles de commande dans la table order_items
   */
  private async createOrderItems(orderId: string, items: any[]): Promise<{ success: boolean; error: any }> {
    try {
      console.log('🛍️ Création des articles de commande groupée pour la commande:', orderId);
      
      const orderItems = items.map(item => ({
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        special_instructions: item.special_instructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (error) {
        console.error('❌ Erreur lors de la création des articles de commande groupée:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Articles de commande groupée créés avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création des articles de commande groupée:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  /**
   * Générer un numéro de commande unique
   */
  private async generateOrderNumber(): Promise<string> {
    try {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      return `ORDER-${timestamp}-${random}`.toUpperCase();
    } catch (error) {
      console.error('❌ Erreur lors de la génération du numéro de commande:', error);
      return `ORDER-${Date.now()}`;
    }
  }

  /**
   * Récupérer un groupe de livraison (via la commande temporaire)
   */
  async getDeliveryGroup(groupId: string): Promise<{ group: DeliveryGroup | null; error: any }> {
    try {
      // Récupérer la commande temporaire qui représente le groupe
      const { data: tempOrder, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_group_id', groupId)
        .eq('group_sequence', 0)
        .eq('is_grouped_delivery', true)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération du groupe de livraison:', error);
        return { group: null, error };
      }

      // Convertir la commande temporaire en objet DeliveryGroup
      const group: DeliveryGroup = {
        id: groupId,
        user_id: tempOrder.user_id,
        delivery_address: tempOrder.delivery_address,
        delivery_instructions: tempOrder.delivery_instructions,
        delivery_method: tempOrder.delivery_method,
        delivery_type: tempOrder.delivery_type,
        payment_method: tempOrder.payment_method,
        total_amount: tempOrder.total,
        total_delivery_fee: tempOrder.delivery_fee || 0,
        landmark: tempOrder.landmark,
        scheduled_delivery_window_start: tempOrder.scheduled_delivery_window_start,
        scheduled_delivery_window_end: tempOrder.scheduled_delivery_window_end,
        zone: tempOrder.zone,
        commune: tempOrder.commune,
        quartier: tempOrder.quartier,
        status: tempOrder.status,
        driver_id: tempOrder.driver_id,
        transaction_id: tempOrder.transaction_id,
        created_at: tempOrder.created_at,
        updated_at: tempOrder.updated_at
      };

      return { group, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du groupe de livraison:', error);
      return { group: null, error };
    }
  }

  /**
   * Récupérer les commandes d'un groupe
   */
  async getGroupedOrders(groupId: string): Promise<{ orders: GroupedOrder[]; error: any }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_group_id', groupId)
        .order('group_sequence', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes groupées:', error);
        return { orders: [], error };
      }

      return { orders: orders || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes groupées:', error);
      return { orders: [], error };
    }
  }

  /**
   * Mettre à jour le transaction_id pour le groupe
   */
  async updateGroupTransactionId(groupId: string, transactionId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Mettre à jour toutes les commandes du groupe (y compris la temporaire)
      const { error } = await supabase
        .from('orders')
        .update({ 
          transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('delivery_group_id', groupId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du transaction_id:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du transaction_id:', error);
      return { success: false, error };
    }
  }

  /**
   * Nettoyer la commande temporaire
   */
  async cleanupTempOrder(groupId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Supprimer la commande temporaire (group_sequence = 0)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('delivery_group_id', groupId)
        .eq('group_sequence', 0)
        .eq('is_grouped_delivery', true);

      if (error) {
        console.error('❌ Erreur lors de la suppression de la commande temporaire:', error);
        return { success: false, error };
      }

      console.log('✅ Commande temporaire supprimée avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la commande temporaire:', error);
      return { success: false, error };
    }
  }
}

export const deliveryGroupService = new DeliveryGroupService();
export default deliveryGroupService;
