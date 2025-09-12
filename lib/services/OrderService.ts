import { supabase } from '../supabase/config';

// Types adaptés au schéma de base de données
// 
// IMPORTANT: Ce service gère uniquement les commandes normales (nourriture/restaurant)
// Les commandes de packages/colis sont gérées par le service PackageOrderService
// La séparation est maintenant automatique au niveau du service
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
  // business_name n'existe pas dans le schéma mobile
  // items n'existe pas dans le schéma mobile (table séparée order_items)
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  service_fee: number; // Renommé de 'tax' vers 'service_fee'
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: 'cash' | 'orange_money' | 'mtn_money' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  estimated_delivery?: string;
  actual_delivery?: string;
  driver_id?: string;
  customer_rating?: number;
  customer_review?: string;
  pickup_coordinates?: { latitude: number; longitude: number };
  delivery_coordinates?: { latitude: number; longitude: number };
  
  // Champs de livraison programmée
  preferred_delivery_time?: string;
  delivery_type?: 'asap' | 'scheduled';
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  
  // Point de repère et zone
  landmark?: string;
  zone?: string;
  commune?: string;
  quartier?: string;
  
  // Coordonnées GPS
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_formatted_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  pickup_formatted_address?: string;
  
  // Autres champs
  order_number?: string;
  verification_code?: string;
  assigned_at?: string;
  delivery_group_id?: string;
  transaction_id?: string;
  is_grouped_delivery?: boolean;
  group_sequence?: number;
  available_for_drivers?: boolean;
  
  // Champs pour les commandes groupées
  business_name?: string; // Nom du commerce (pour l'affichage)
  items?: OrderItem[]; // Items de la commande (pour l'affichage)
  is_grouped?: boolean; // Indique si c'est une commande groupée
  group_orders?: Order[]; // Autres commandes du même groupe
  group_total?: number; // Total du groupe
  group_delivery_fee?: number; // Frais de livraison du groupe
  
  created_at: string;
  updated_at: string;
}

export interface OrderData {
  user_id: string;
  business_id?: number;
  // business_name n'existe pas dans le schéma mobile
  // items n'existe pas dans le schéma mobile (table séparée order_items)
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  service_fee: number; // Renommé de 'tax' vers 'service_fee' pour correspondre au schéma
  grand_total: number;
  delivery_method: 'delivery' | 'pickup';
  
  // Adresse de livraison
  delivery_address?: string;
  delivery_instructions?: string;
  landmark?: string; // Point de repère
  
  // Coordonnées GPS
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_formatted_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  pickup_formatted_address?: string;
  
  // Coordonnées JSONB
  pickup_coordinates?: { latitude: number; longitude: number };
  delivery_coordinates?: { latitude: number; longitude: number };
  
  // Zone géographique
  zone?: string;
  commune?: string;
  quartier?: string;
  
  payment_method: 'cash' | 'orange_money' | 'mtn_money' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  
  // Type de livraison
  delivery_type?: 'asap' | 'scheduled';
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  preferred_delivery_time?: string;
  
  // Champs optionnels selon le schéma mobile
  estimated_delivery?: string;
  actual_delivery?: string; // ✅ Existe dans le schéma
  driver_id?: string;
  customer_rating?: number;
  customer_review?: string;
  
  // Champs qui n'existent pas dans le schéma mobile (à supprimer)
  // business_name, items, driver_name, driver_phone, driver_location,
  // estimated_pickup_time, estimated_delivery_time, actual_pickup_time, actual_delivery_time
}

export interface PaymentMethod {
  id: number;
  name: string;
  icon: string;
  description?: string;
  is_available: boolean;
}

class OrderService {
  // Générer un numéro de commande unique
  private async generateOrderNumber(): Promise<string> {
    try {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      return `ORDER-${timestamp}-${random}`.toUpperCase();
    } catch (error) {
      console.error('❌ Erreur lors de la génération du numéro de commande:', error);
      // Fallback avec timestamp
      return `ORDER-${Date.now()}`;
    }
  }

  // Récupérer toutes les commandes d'un utilisateur avec leurs items (excluant les packages/colis)
  async getUserOrders(userId: string): Promise<{ orders: Order[]; error: any }> {
    try {
      console.log('🔍 DEBUG - getUserOrders appelé pour userId:', userId);
      
      // Récupérer les commandes avec leurs items et informations de commerce
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            menu_item_id,
            name,
            price,
            quantity,
            special_instructions,
            menu_item:menu_items (
              id,
              name,
              description,
              price,
              image,
              is_popular
            )
          ),
          businesses (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes:', error);
        return { orders: [], error };
      }

      // Récupérer les IDs des commandes de colis pour les exclure
      const { data: packageOrderIds, error: packageError } = await supabase
        .from('package_orders')
        .select('order_id')
        .not('order_id', 'is', null);

      if (packageError) {
        console.error('❌ Erreur lors de la récupération des IDs de colis:', packageError);
      }

      // Filtrer les commandes pour exclure les commandes de colis
      const packageOrderIdSet = new Set(packageOrderIds?.map(p => p.order_id) || []);
      const filteredOrders = (orders || []).filter(order => !packageOrderIdSet.has(order.id));

      console.log('🔍 DEBUG - Requête Supabase exécutée');
      console.log('🔍 DEBUG - Erreur Supabase:', error);
      console.log('🔍 DEBUG - Données brutes reçues:', orders);
      console.log('🔍 DEBUG - Nombre de commandes brutes:', orders?.length || 0);
      console.log('🔍 DEBUG - Nombre de commandes après filtrage des colis:', filteredOrders.length);

      // Traiter les commandes pour gérer les groupes
      const processedOrders = await this.processGroupedOrders(filteredOrders);

      console.log('🔍 DEBUG - Commandes transformées:', processedOrders);
      console.log('🔍 DEBUG - Nombre de commandes transformées:', processedOrders.length);
      console.log('🔍 DEBUG - Premier ordre transformé:', processedOrders[0]);

      console.log('✅ Commandes récupérées avec items:', processedOrders.length);
      return { orders: processedOrders, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      return { orders: [], error };
    }
  }

  // Traiter les commandes pour gérer les groupes de livraison
  private async processGroupedOrders(orders: any[]): Promise<Order[]> {
    // Grouper les commandes par delivery_group_id
    const groupedOrders = new Map<string, any[]>();
    const standaloneOrders: any[] = [];

    orders.forEach(order => {
      if (order.delivery_group_id) {
        if (!groupedOrders.has(order.delivery_group_id)) {
          groupedOrders.set(order.delivery_group_id, []);
        }
        groupedOrders.get(order.delivery_group_id)!.push(order);
      } else {
        standaloneOrders.push(order);
      }
    });

    const processedOrders: Order[] = [];

    // Traiter les commandes groupées
    for (const [groupId, groupOrders] of groupedOrders) {
      if (groupOrders.length > 1) {
        // Créer une commande groupée principale
        const mainOrder = groupOrders[0];
        const groupTotal = groupOrders.reduce((sum, order) => sum + (order.grand_total || 0), 0);
        const groupDeliveryFee = groupOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0);

        const groupedOrder: Order = {
          ...mainOrder,
          business_name: `${groupOrders.length} services`,
          is_grouped: true,
          group_orders: groupOrders.map(order => ({
            ...order,
            business_name: order.businesses?.name || `Business ${order.business_id}`,
            items: (order.order_items || []).map(item => ({
              id: item.id,
              name: item.name || item.menu_item?.name || 'Article inconnu',
              price: item.price || item.menu_item?.price || 0,
              quantity: item.quantity,
              specialInstructions: item.special_instructions,
              image: item.menu_item?.image
            }))
          })),
          group_total: groupTotal,
          group_delivery_fee: groupDeliveryFee,
          grand_total: groupTotal,
          items: groupOrders.flatMap(order => 
            (order.order_items || []).map(item => ({
              id: item.id,
              name: item.name || item.menu_item?.name || 'Article inconnu',
              price: item.price || item.menu_item?.price || 0,
              quantity: item.quantity,
              specialInstructions: item.special_instructions,
              image: item.menu_item?.image
            }))
          )
        };

        processedOrders.push(groupedOrder);
      } else {
        // Commande seule dans un groupe (cas rare)
        const order = groupOrders[0];
        processedOrders.push({
          ...order,
          business_name: order.businesses?.name || `Business ${order.business_id}`,
          items: (order.order_items || []).map(item => ({
            id: item.id,
            name: item.name || item.menu_item?.name || 'Article inconnu',
            price: item.price || item.menu_item?.price || 0,
            quantity: item.quantity,
            specialInstructions: item.special_instructions,
            image: item.menu_item?.image
          }))
        });
      }
    }

    // Ajouter les commandes standalone
    standaloneOrders.forEach(order => {
      processedOrders.push({
        ...order,
        business_name: order.businesses?.name || `Business ${order.business_id}`,
        items: (order.order_items || []).map(item => ({
          id: item.id,
          name: item.name || item.menu_item?.name || 'Article inconnu',
          price: item.price || item.menu_item?.price || 0,
          quantity: item.quantity,
          specialInstructions: item.special_instructions,
          image: item.menu_item?.image
        }))
      });
    });

    // Trier par date de création
    return processedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Récupérer une commande spécifique avec ses items (excluant les packages/colis)
  async getOrder(orderId: string): Promise<{ order: Order | null; error: any }> {
    try {
      // Vérifier d'abord que ce n'est pas une commande de colis
      const { data: packageOrder, error: packageError } = await supabase
        .from('package_orders')
        .select('order_id')
        .eq('order_id', orderId)
        .single();

      if (packageError && packageError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erreur lors de la vérification des packages:', packageError);
      }

      // Si c'est une commande de colis, retourner null
      if (packageOrder) {
        console.log('🔍 DEBUG - Commande exclue (package/colis):', orderId);
        return { order: null, error: 'Commande de colis non autorisée' };
      }

      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            menu_item_id,
            name,
            price,
            quantity,
            special_instructions,
            menu_item:menu_items (
              id,
              name,
              description,
              price,
              image,
              is_popular
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération de la commande:', error);
        return { order: null, error };
      }

      // Transformer les données pour inclure les items
      if (order) {
        const orderWithItems = {
          ...order,
          items: (order.order_items || []).map(item => ({
            id: item.id,
            name: item.name || item.menu_item?.name || 'Article inconnu',
            price: item.price || item.menu_item?.price || 0,
            quantity: item.quantity,
            specialInstructions: item.special_instructions,
            image: item.menu_item?.image
          }))
        };

        console.log('✅ Commande récupérée avec items:', orderWithItems.id);
        return { order: orderWithItems, error: null };
      }

      return { order: null, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la commande:', error);
      return { order: null, error };
    }
  }

  // Récupérer uniquement les items d'une commande
  async getOrderItems(orderId: string): Promise<{ items: any[]; error: any }> {
    try {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          id,
          menu_item_id,
          name,
          price,
          quantity,
          special_instructions,
          menu_item:menu_items (
            id,
            name,
            description,
            price,
            image,
            is_popular
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des items de commande:', error);
        return { items: [], error };
      }

      // Transformer les données
      const items = (orderItems || []).map(item => ({
        id: item.id,
        name: item.name || item.menu_item?.name || 'Article inconnu',
        price: item.price || item.menu_item?.price || 0,
        quantity: item.quantity,
        specialInstructions: item.special_instructions,
        image: item.menu_item?.image
      }));

      console.log('✅ Items de commande récupérés:', items.length);
      return { items, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des items de commande:', error);
      return { items: [], error };
    }
  }

  // Créer une nouvelle commande
  async createOrder(orderData: OrderData, cart?: any): Promise<{ orderId: string | null; error: any }> {
    try {
      console.log('🛒 Création de commande avec les données:', orderData);

      // Générer un numéro de commande unique
      const orderNumber = await this.generateOrderNumber();

      // Préparer les données pour l'insertion (adapté au schéma mobile)
      const orderToInsert = {
        user_id: orderData.user_id,
        business_id: orderData.business_id,
        // business_name n'existe pas dans le schéma mobile
        // items n'existe pas dans le schéma mobile (table séparée order_items)
        status: orderData.status,
        total: orderData.total,
        delivery_fee: orderData.delivery_fee,
        service_fee: orderData.service_fee, // Renommé de 'tax' vers 'service_fee'
        grand_total: orderData.grand_total,
        delivery_method: orderData.delivery_method,
        
        // Adresse de livraison
        delivery_address: orderData.delivery_address,
        delivery_instructions: orderData.delivery_instructions,
        landmark: orderData.landmark,
        
        // Coordonnées GPS
        delivery_latitude: orderData.delivery_latitude,
        delivery_longitude: orderData.delivery_longitude,
        delivery_formatted_address: orderData.delivery_formatted_address,
        pickup_latitude: orderData.pickup_latitude,
        pickup_longitude: orderData.pickup_longitude,
        pickup_formatted_address: orderData.pickup_formatted_address,
        
        // Coordonnées JSONB
        pickup_coordinates: orderData.pickup_coordinates,
        delivery_coordinates: orderData.delivery_coordinates,
        
        // Zone géographique
        zone: orderData.zone,
        commune: orderData.commune,
        quartier: orderData.quartier,
        
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status,
        
        // Type de livraison
        delivery_type: orderData.delivery_type,
        scheduled_delivery_window_start: orderData.scheduled_delivery_window_start,
        scheduled_delivery_window_end: orderData.scheduled_delivery_window_end,
        preferred_delivery_time: orderData.preferred_delivery_time,
        
        // Champs optionnels selon le schéma mobile
        estimated_delivery: orderData.estimated_delivery,
        actual_delivery: orderData.actual_delivery,
        driver_id: orderData.driver_id,
        customer_rating: orderData.customer_rating,
        customer_review: orderData.customer_review,
        
        // Champs qui n'existent pas dans le schéma mobile (supprimés)
        // business_name, items, driver_name, driver_phone, driver_location,
        // estimated_pickup_time, estimated_delivery_time, actual_pickup_time, actual_delivery_time
      };

      console.log('🔍 DEBUG - Données de commande à insérer:', JSON.stringify(orderToInsert, null, 2));

      // Insérer la commande
      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderToInsert])
        .select('id')
        .single();

      if (error) {
        console.error('❌ ERREUR lors de la création de la commande:', error);
        console.error('❌ Code d\'erreur:', error.code);
        console.error('❌ Message d\'erreur:', error.message);
        console.error('❌ Détails:', error.details);
        console.error('❌ Hint:', error.hint);
        
        // 🔍 DEBUG: Analyser l'erreur spécifiquement pour "value too long"
        if (error.code === '22001') {
          console.error('🔍 ERREUR 22001 DÉTECTÉE - Valeur trop longue pour un champ');
          console.error('🔍 Cela indique qu\'une valeur dépasse la limite de caractères définie dans la base de données');
          console.error('🔍 Vérifiez les champs avec des contraintes de longueur (character varying)');
        }
        
        return { orderId: null, error: error.message };
      }

      console.log('✅ Commande créée avec succès:', order.id);
      console.log('✅ Numéro de commande généré:', orderNumber);
      
      // Créer les articles de commande dans la table order_items
      if (cart?.items && cart.items.length > 0) {
        try {
          await this.createOrderItems(order.id, cart.items);
          console.log('✅ Articles de commande créés avec succès');
        } catch (itemsError) {
          console.warn('⚠️ Erreur lors de la création des articles de commande:', itemsError);
          // Ne pas faire échouer la création de commande pour une erreur d'articles
        }
      }
      
      // Créer automatiquement un paiement pour la commande
      try {
        await this.createPayment(order.id, orderData.grand_total, orderData.payment_method);
        console.log('✅ Paiement créé automatiquement pour la commande');
      } catch (paymentError) {
        console.warn('⚠️ Erreur lors de la création automatique du paiement:', paymentError);
        // Ne pas faire échouer la création de commande pour une erreur de paiement
      }

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
      console.log('💳 Création du paiement:', { orderId, amount, method });
      
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
        console.error('❌ Code d\'erreur:', error.code);
        console.error('❌ Message d\'erreur:', error.message);
        return { paymentId: null, error: error.message };
      }

      console.log('✅ Paiement créé avec succès:', payment.id);
      return { paymentId: payment.id, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création du paiement:', error);
      return { paymentId: null, error: error instanceof Error ? error.message : 'Erreur inconnue' };
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

  // Noter une commande ET le livreur
  async rateOrder(orderId: string, rating: number, review?: string): Promise<{ success: boolean; error: any }> {
    try {
      if (rating < 1 || rating > 5) {
        return { success: false, error: 'La note doit être entre 1 et 5' };
      }

      console.log('⭐ Notation de la commande:', { orderId, rating, review });

      // 1. Noter la commande (existant)
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          customer_rating: rating,
          customer_review: review,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('❌ Erreur lors de la notation de la commande:', orderError);
        return { success: false, error: orderError };
      }

      console.log('✅ Commande notée avec succès');

      // 2. NOUVEAU : Noter le livreur si la commande a un driver
      try {
        const { data: order, error: orderFetchError } = await supabase
          .from('orders')
          .select('driver_id, user_id, status')
          .eq('id', orderId)
          .single();

        if (orderFetchError) {
          console.error('❌ Erreur lors de la récupération des infos de commande:', orderFetchError);
          // Ne pas faire échouer la notation de la commande
          return { success: true, error: null };
        }

        // Vérifier que la commande a un driver et est livrée
        if (order?.driver_id && order?.user_id && order?.status === 'delivered') {
          console.log('🚗 Commande avec driver détectée, notation du livreur...');
          
          // Créer un avis pour le livreur
          const { data: reviewResult, error: reviewError } = await supabase.rpc('create_driver_review', {
            p_driver_id: order.driver_id,
            p_order_id: orderId,
            p_customer_id: order.user_id,
            p_rating: rating,
            p_comment: review || null
          });

          if (reviewError) {
            console.error('❌ Erreur lors de l\'appel de create_driver_review:', reviewError);
            // Ne pas faire échouer la notation de la commande
          } else if (reviewResult && !reviewResult.success) {
            console.warn('⚠️ Erreur lors de la notation du livreur:', reviewResult.error);
            // Ne pas faire échouer la notation de la commande
          } else {
            console.log('✅ Livreur noté avec succès:', reviewResult);
          }
        } else {
          console.log('ℹ️ Commande sans driver ou non livrée, pas de notation de livreur');
        }
      } catch (driverReviewError) {
        console.error('❌ Erreur lors de la notation du livreur:', driverReviewError);
        // Ne pas faire échouer la notation de la commande
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la notation de la commande:', error);
      return { success: false, error };
    }
  }

  // Récupérer les commandes par statut (excluant les packages/colis)
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

      // Récupérer les IDs des commandes de colis pour les exclure
      const { data: packageOrderIds, error: packageError } = await supabase
        .from('package_orders')
        .select('order_id')
        .not('order_id', 'is', null);

      if (packageError) {
        console.error('❌ Erreur lors de la récupération des IDs de colis:', packageError);
      }

      // Filtrer les commandes pour exclure les commandes de colis
      const packageOrderIdSet = new Set(packageOrderIds?.map(p => p.order_id) || []);
      const filteredOrders = (orders || []).filter(order => !packageOrderIdSet.has(order.id));

      console.log('🔍 DEBUG - Commandes par statut après filtrage des colis:', filteredOrders.length);
      return { orders: filteredOrders, error: null };
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

  // Créer les articles de commande dans la table order_items
  async createOrderItems(orderId: string, items: CartItem[]): Promise<{ success: boolean; error: any }> {
    try {
      console.log('🛍️ Création des articles de commande pour la commande:', orderId);
      
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

      console.log('🔍 DEBUG - Articles de commande à insérer:', JSON.stringify(orderItems, null, 2));

      const { error } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (error) {
        console.error('❌ Erreur lors de la création des articles de commande:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Articles de commande créés avec succès');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création des articles de commande:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }
}

export const orderService = new OrderService();
export default orderService; 