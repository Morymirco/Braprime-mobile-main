import { supabase } from '../supabase/config';

// Fonction pour générer un ID unique compatible React Native
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface CartItem {
  id: string;
  cart_id: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
  business_id?: number; // Ajouté pour associer l'article à son business
  business_name?: string; // Ajouté pour associer l'article à son business
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  business_id?: number;
  business_name?: string;
  business_delivery_fee?: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
  total?: number;
  item_count?: number;
  // Propriétés pour les paniers multi-services
  is_multi_service?: boolean;
  business_count?: number;
  businesses?: Array<{
    id: number;
    name: string;
    item_count: number;
    total: number;
  }>;
}

export interface AddToCartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
}

export interface LocalCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CreateCartItemData {
  menu_item_id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
}

export interface UpdateCartItemData {
  quantity?: number;
  special_instructions?: string;
}

export class CartService {
  /**
   * Récupérer tous les paniers d'un utilisateur (un par service)
   */
  static async getAllCarts(userId: string): Promise<{ carts: Cart[]; error: string | null }> {
    try {
      console.log('🔍 getAllCarts appelé pour userId:', userId);
      
      // Récupérer tous les paniers de l'utilisateur
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select(`
          id,
          user_id,
          business_id,
          delivery_method,
          delivery_address,
          delivery_instructions,
          created_at,
          updated_at,
          businesses (
            id,
            name,
            delivery_fee,
            business_types (name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cartError) {
        console.error('❌ Erreur lors de la récupération des paniers:', cartError);
        return { carts: [], error: cartError.message };
      }

      console.log('📦 Carts trouvés:', cartData?.length || 0, cartData);

      if (!cartData || cartData.length === 0) {
        console.log('⚠️ Aucun cart trouvé pour userId:', userId);
        return { carts: [], error: null };
      }

      // Pour chaque panier, récupérer ses articles
      const carts: Cart[] = [];
      
      for (const cart of cartData) {
        console.log('🔍 Récupération des items pour cart:', cart.id);
        
        const { data: cartItems, error: itemsError } = await supabase
          .from('cart_items')
          .select(`
            *,
            menu_items (
              *,
              businesses (
                id,
                name,
                delivery_fee,
                business_types (name)
              )
            )
          `)
          .eq('cart_id', cart.id);

        if (itemsError) {
          console.error(`❌ Erreur lors de la récupération des articles du panier ${cart.id}:`, itemsError);
          continue;
        }

        console.log('📦 Items trouvés pour cart', cart.id, ':', cartItems?.length || 0, cartItems);

        // Calculer le total et le nombre d'articles
        let total = 0;
        let itemCount = 0;
        const items = cartItems?.map(item => {
          total += item.price * item.quantity;
          itemCount += item.quantity; // Somme des quantités, pas le nombre d'articles uniques
          return {
            id: item.id,
            cart_id: item.cart_id,
            menu_item_id: item.menu_item_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            special_instructions: item.special_instructions,
            business_id: cart.business_id, // Ajouté: associer l'article à son business
            business_name: (cart.businesses as any)?.name || '', // Ajouté: associer l'article à son business
            created_at: item.created_at,
            updated_at: item.updated_at
          };
        }) || [];

        const cartObj: Cart = {
          id: cart.id,
          user_id: cart.user_id,
          business_id: cart.business_id || 0,
          business_name: (cart.businesses as any)?.name || '',
          business_delivery_fee: (cart.businesses as any)?.delivery_fee || 0,
          delivery_method: cart.delivery_method || 'delivery',
          delivery_address: cart.delivery_address || '',
          delivery_instructions: cart.delivery_instructions || '',
          created_at: cart.created_at,
          updated_at: cart.updated_at,
          items: items,
          total: total,
          item_count: itemCount,
          is_multi_service: false, // Un seul service par panier
          business_count: 1,
          businesses: cart.business_id ? [{
            id: cart.business_id,
            name: (cart.businesses as any)?.name || '',
            item_count: items.length,
            total: total
          }] : []
        };

        carts.push(cartObj);
      }

      console.log('✅ getAllCarts terminé. Carts retournés:', carts.length, carts);
      return { carts, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des paniers:', error);
      return { carts: [], error: 'Erreur lors de la récupération des paniers' };
    }
  }

  /**
   * Récupérer un panier spécifique d'un utilisateur (par business_id)
   */
  static async getCartByBusiness(userId: string, businessId: number): Promise<{ cart: Cart | null; error: string | null }> {
    try {
      // Récupérer le panier spécifique au business
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select(`
          id,
          user_id,
          business_id,
          delivery_method,
          delivery_address,
          delivery_instructions,
          created_at,
          updated_at,
          businesses (
            id,
            name,
            delivery_fee,
            business_types (name)
          )
        `)
        .eq('user_id', userId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (cartError) {
        console.error('Erreur lors de la récupération du panier:', cartError);
        return { cart: null, error: cartError.message };
      }

      if (!cartData) {
        return { cart: null, error: null };
      }

      // Récupérer les articles du panier
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          *,
          menu_items (
            *,
            businesses (
              id,
              name,
              delivery_fee,
              business_types (name)
            )
          )
        `)
        .eq('cart_id', cartData.id);

      if (itemsError) {
        console.error('Erreur lors de la récupération des articles du panier:', itemsError);
        return { cart: null, error: itemsError.message };
      }

      // Calculer le total et le nombre d'articles
      let total = 0;
      let itemCount = 0;
      const items = cartItems?.map(item => {
        total += item.price * item.quantity;
        itemCount += item.quantity; // Somme des quantités, pas le nombre d'articles uniques
        return {
          id: item.id,
          cart_id: item.cart_id,
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          special_instructions: item.special_instructions,
          business_id: cartData.business_id,
          business_name: (cartData.businesses as any)?.name || '',
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      }) || [];

      const cart: Cart = {
        id: cartData.id,
        user_id: cartData.user_id,
        business_id: cartData.business_id,
        business_name: (cartData.businesses as any)?.name || '',
        business_delivery_fee: (cartData.businesses as any)?.delivery_fee || 0,
        delivery_method: cartData.delivery_method || 'delivery',
        delivery_address: cartData.delivery_address || '',
        delivery_instructions: cartData.delivery_instructions || '',
        created_at: cartData.created_at,
        updated_at: cartData.updated_at,
        items: items,
        total: total,
        item_count: itemCount,
        is_multi_service: false,
        business_count: 1,
        businesses: cartData.business_id ? [{
          id: cartData.business_id,
          name: (cartData.businesses as any)?.name || '',
          item_count: items.length,
          total: total
        }] : []
      };

      return { cart, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      return { cart: null, error: 'Erreur lors de la récupération du panier' };
    }
  }

  /**
   * Récupérer le panier complet d'un utilisateur (méthode existante pour compatibilité)
   */
  static async getCart(userId: string): Promise<{ cart: Cart | null; error: string | null }> {
    try {
      // Utiliser getAllCarts pour récupérer tous les paniers
      const { carts, error } = await this.getAllCarts(userId);
      
      if (error) {
        return { cart: null, error };
      }

      if (!carts || carts.length === 0) {
        return { cart: null, error: null };
      }

      // Si un seul panier, le retourner directement
      if (carts.length === 1) {
        return { cart: carts[0], error: null };
      }

      // Si plusieurs paniers, créer un panier global (comme dans le client)
      const totalItems = carts.reduce((sum, cart) => sum + (cart.item_count || 0), 0);
      const totalAmount = carts.reduce((sum, cart) => sum + (cart.total || 0), 0);

      const globalCart: Cart = {
        id: 'global',
        user_id: userId,
        business_id: undefined,
        business_name: 'Multi-services',
        business_delivery_fee: 0,
        delivery_method: 'delivery',
        delivery_address: '',
        delivery_instructions: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: carts.flatMap(cart => 
          (cart.items || []).map(item => ({
            ...item,
            business_id: cart.business_id,
            business_name: cart.business_name
          }))
        ),
        total: totalAmount,
        item_count: totalItems,
        is_multi_service: true,
        business_count: carts.length,
        businesses: carts.map(cart => ({
          id: cart.business_id || 0,
          name: cart.business_name || '',
          item_count: cart.item_count || 0,
          total: cart.total || 0
        }))
      };

      return { cart: globalCart, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      return { cart: null, error: 'Erreur lors de la récupération du panier' };
    }
  }

  /**
   * Créer un nouveau panier pour un utilisateur (seulement si nécessaire)
   */
  static async createCart(userId: string, businessId?: number): Promise<{ cartId: string | null; error: string | null }> {
    try {
      // Vérifier que l'utilisateur est authentifié
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erreur d\'authentification:', authError);
        return { cartId: null, error: 'Utilisateur non authentifié' };
      }

      // Vérifier que l'utilisateur correspond
      if (user.id !== userId) {
        console.error('ID utilisateur ne correspond pas');
        return { cartId: null, error: 'ID utilisateur invalide' };
      }

      // Vérifier d'abord si un panier existe déjà pour cet utilisateur ET ce business
      let query = supabase
        .from('cart')
        .select('id, created_at')
        .eq('user_id', userId);
      
      // Ajouter la condition business_id seulement si businessId est défini
      if (businessId && businessId > 0) {
        query = query.eq('business_id', businessId);
      } else {
        query = query.is('business_id', null);
      }
      
      const { data: existingCarts, error: checkError } = await query;
      
      if (checkError) {
        console.error('Erreur lors de la vérification du panier existant:', checkError);
        return { cartId: null, error: checkError.message };
      }
      
      // Gérer le cas où il y a plusieurs paniers (doublons)
      let existingCart = null;
      if (existingCarts && existingCarts.length > 0) {
        if (existingCarts.length === 1) {
          existingCart = existingCarts[0];
        } else {
          // Il y a des doublons, nettoyer automatiquement
          console.warn(`Doublons détectés pour user_id=${userId}, business_id=${businessId}. Nettoyage automatique...`);
          
          // Garder le cart le plus récent
          existingCarts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          existingCart = existingCarts[0];
          
          // Supprimer les autres carts
          for (let i = 1; i < existingCarts.length; i++) {
            await supabase
              .from('cart')
              .delete()
              .eq('id', existingCarts[i].id);
          }
          
          console.log(`${existingCarts.length - 1} doublons supprimés`);
        }
      }

      // Si un panier existe déjà pour ce business, retourner son ID
      if (existingCart) {
        console.log(`Panier existant trouvé pour business ${businessId}: ${existingCart.id}`);
        return { cartId: existingCart.id, error: null };
      }

      // Préparer les données d'insertion
      const insertData: any = {
          user_id: userId,
          delivery_method: 'delivery'
      };

      // Logique intelligente pour business_id
      if (businessId && businessId > 0) {
        // Vérifier que le business existe et est actif
        const { data: businessExists, error: businessError } = await supabase
          .from('businesses')
          .select('id, is_active')
          .eq('id', businessId)
          .eq('is_active', true)
          .single();

        if (businessError) {
          console.warn(`Business ${businessId} non trouvé ou inactif:`, businessError.message);
          // On continue sans business_id (sera NULL)
        } else if (businessExists) {
          insertData.business_id = businessId;
          console.log(`Panier créé avec business_id: ${businessId}`);
        }
      } else {
        console.log('Panier créé sans business_id (panier général)');
      }

      // Créer le nouveau panier
      const { data, error } = await supabase
        .from('cart')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('Erreur lors de la création du panier:', error);
        return { cartId: null, error: error.message };
      }

      console.log(`Nouveau panier créé: ${data.id}`);
      return { cartId: data.id, error: null };
    } catch (error) {
      console.error('Erreur lors de la création du panier:', error);
      return { cartId: null, error: 'Erreur lors de la création du panier' };
    }
  }

  /**
   * Ajouter un article au panier spécifique d'un service
   */
  static async addToCart(
    userId: string, 
    item: AddToCartItem, 
    businessId: number
  ): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      // Créer ou récupérer le panier spécifique au business
      const { cartId, error: createError } = await this.createCart(userId, businessId);
        if (createError) {
        return { success: false, error: createError, cart: null };
      }
        
      if (!cartId) {
        return { success: false, error: 'Impossible de créer ou récupérer le panier', cart: null };
      }

      // Récupérer l'ID du panier spécifique au business
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', userId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (cartError || !cartData) {
        console.error('Erreur lors de la récupération du panier:', cartError);
        return { success: false, error: 'Panier non trouvé', cart: null };
      }

      // Vérifier si l'article existe déjà dans le panier
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartData.id)
        .eq('menu_item_id', item.menu_item_id)
        .maybeSingle();

      if (existingItem) {
        // Mettre à jour la quantité de l'article existant
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity: existingItem.quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Erreur lors de la mise à jour de la quantité:', updateError);
          return { success: false, error: updateError.message, cart: null };
        }
      } else {
      // Ajouter le nouvel article
        const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
            cart_id: cartData.id,
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          special_instructions: item.special_instructions
        });

        if (insertError) {
          console.error('Erreur lors de l\'ajout de l\'article:', insertError);
          return { success: false, error: insertError.message, cart: null };
        }
      }

      // Récupérer le panier mis à jour
      const { cart: updatedCart } = await this.getCartByBusiness(userId, businessId);
      
      return { success: true, error: null, cart: updatedCart };
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      return { success: false, error: 'Erreur lors de l\'ajout au panier', cart: null };
    }
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  static async updateQuantity(itemId: string, quantity: number): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      // Récupérer l'utilisateur et le cart à partir de l'item
      const { data: cartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          cart_id,
          cart:cart(user_id)
        `)
        .eq('id', itemId)
        .maybeSingle();

      if (fetchError || !cartItem) {
        return { success: false, error: 'Article non trouvé', cart: null };
      }

      const userId = (cartItem.cart as any)?.user_id;
      const cartId = cartItem.cart_id;

      if (!userId) {
        return { success: false, error: 'Utilisateur non trouvé', cart: null };
      }

      if (quantity <= 0) {
        // Supprimer l'article et vérifier si le cart devient vide
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (deleteError) {
          console.error('Erreur lors de la suppression de l\'article:', deleteError);
          return { success: false, error: deleteError.message, cart: null };
        }

        // Vérifier si le cart est maintenant vide
        const { data: remainingItems, error: checkError } = await supabase
          .from('cart_items')
          .select('id')
          .eq('cart_id', cartId);

        if (checkError) {
          console.error('Erreur lors de la vérification des articles restants:', checkError);
        } else if (!remainingItems || remainingItems.length === 0) {
          // Le cart est vide, le supprimer
          console.log(`Cart ${cartId} est vide, suppression...`);
          const { error: cartDeleteError } = await supabase
            .from('cart')
            .delete()
            .eq('id', cartId);

          if (cartDeleteError) {
            console.error('Erreur lors de la suppression du cart vide:', cartDeleteError);
          } else {
            console.log(`✅ Cart ${cartId} supprimé car vide`);
          }
        }
      } else {
        // Mettre à jour la quantité
      const { error } = await supabase
        .from('cart_items')
          .update({
            quantity: quantity,
            updated_at: new Date().toISOString()
          })
        .eq('id', itemId);

      if (error) {
          console.error('Erreur lors de la mise à jour de la quantité:', error);
          return { success: false, error: error.message, cart: null };
        }
      }

      // Récupérer le panier mis à jour en utilisant getAllCarts
      const { carts } = await this.getAllCarts(userId);
      const updatedCart = carts.length > 0 ? carts[0] : null;
      return { success: true, error: null, cart: updatedCart };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      return { success: false, error: 'Erreur lors de la mise à jour de la quantité', cart: null };
    }
  }

  /**
   * Supprimer un article du panier
   */
  static async removeFromCart(itemId: string): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      // Récupérer l'ID de l'utilisateur et du cart avant de supprimer
      const { data: cartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          cart_id,
          cart:cart(user_id)
        `)
        .eq('id', itemId)
        .maybeSingle();

      if (fetchError || !cartItem) {
        return { success: false, error: 'Article non trouvé', cart: null };
      }

      const userId = (cartItem.cart as any)?.user_id;
      const cartId = cartItem.cart_id;

      if (!userId) {
        return { success: false, error: 'Utilisateur non trouvé', cart: null };
      }

      // Supprimer l'article directement
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('Erreur lors de la suppression de l\'article:', deleteError);
        return { success: false, error: deleteError.message, cart: null };
      }

      // Vérifier si le cart est maintenant vide
      const { data: remainingItems, error: checkError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('cart_id', cartId);

      if (checkError) {
        console.error('Erreur lors de la vérification des articles restants:', checkError);
      } else if (!remainingItems || remainingItems.length === 0) {
        // Le cart est vide, le supprimer
        console.log(`Cart ${cartId} est vide, suppression...`);
        const { error: cartDeleteError } = await supabase
          .from('cart')
          .delete()
          .eq('id', cartId);

        if (cartDeleteError) {
          console.error('Erreur lors de la suppression du cart vide:', cartDeleteError);
        } else {
          console.log(`✅ Cart ${cartId} supprimé car vide`);
        }
      }

      // Récupérer les paniers mis à jour
      const { carts } = await this.getAllCarts(userId);
      const updatedCart = carts.length > 0 ? carts[0] : null;
      return { success: true, error: null, cart: updatedCart };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      return { success: false, error: 'Erreur lors de la suppression de l\'article', cart: null };
    }
  }

  /**
   * Vider le panier d'un utilisateur
   */
  static async clearCart(userId: string): Promise<{ success: boolean; error: string | null; cart: Cart | null }> {
    try {
      // Récupérer tous les paniers de l'utilisateur
      const { carts } = await this.getAllCarts(userId);
      
      // Vider tous les paniers
      for (const cart of carts) {
        // Supprimer d'abord tous les cart_items
      const { error: itemsError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      if (itemsError) {
          console.error(`Erreur lors du vidage des items du panier ${cart.id}:`, itemsError);
      }

        // Supprimer ensuite le cart lui-même
      const { error: cartError } = await supabase
        .from('cart')
        .delete()
        .eq('id', cart.id);

      if (cartError) {
          console.error(`Erreur lors de la suppression du panier ${cart.id}:`, cartError);
        } else {
          console.log(`✅ Panier ${cart.id} supprimé avec succès`);
        }
      }

      console.log(`🛒 ${carts.length} panier(s) vidé(s) et supprimé(s) pour l'utilisateur ${userId}`);

      // Retourner un panier vide
      const emptyCart: Cart = {
        id: '',
        user_id: userId,
        business_id: 0,
        business_name: '',
        items: [],
        total: 0,
        item_count: 0,
        delivery_method: 'delivery',
        delivery_address: '',
        delivery_instructions: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { success: true, error: null, cart: emptyCart };
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      return { success: false, error: 'Erreur lors du vidage du panier', cart: null };
    }
  }

  /**
   * Synchroniser les articles du localStorage vers la base de données
   */
  static async syncFromLocal(
    userId: string, 
    localItems: LocalCartItem[], 
    businessId: number
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (localItems.length === 0) {
        return { success: true, error: null };
      }

      // Créer ou récupérer le panier
      const { cartId, error: createError } = await this.createCart(userId, businessId);
        if (createError) {
          return { success: false, error: createError };
        }
        
      if (!cartId) {
          return { success: false, error: 'Erreur lors de la création du panier' };
        }
      
      // Récupérer le panier créé
      const { cart } = await this.getCartByBusiness(userId, businessId);
      if (!cart) {
        return { success: false, error: 'Erreur lors de la récupération du panier' };
      }

      // Ajouter chaque article du localStorage
      for (const localItem of localItems) {
        // Vérifier si l'article existe déjà
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('cart_id', cart.id)
          .eq('menu_item_id', localItem.id)
          .maybeSingle();

        if (existingItem) {
          // Mettre à jour la quantité
          await supabase
            .from('cart_items')
            .update({
              quantity: existingItem.quantity + localItem.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingItem.id);
        } else {
          // Ajouter le nouvel article
          await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              menu_item_id: localItem.id,
              name: localItem.name,
              price: localItem.price,
              quantity: localItem.quantity,
              image: localItem.image
            });
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return { success: false, error: 'Erreur lors de la synchronisation' };
    }
  }

  // Mettre à jour les informations de livraison
  static async updateDeliveryInfo(userId: string, deliveryMethod: 'delivery' | 'pickup', deliveryAddress?: string, deliveryInstructions?: string): Promise<{ cart: Cart | null; error: string | null }> {
    try {
      const { cart: existingCart } = await this.getCart(userId);
      
      if (!existingCart) {
        return { cart: null, error: 'Aucun panier trouvé' };
      }

      const { error } = await supabase
        .from('cart')
        .update({
          delivery_method: deliveryMethod,
          delivery_address: deliveryAddress,
          delivery_instructions: deliveryInstructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCart.id);

      if (error) {
        return { cart: null, error: error.message };
      }

      // Retourner le panier mis à jour
      return this.getCart(userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations de livraison:', error);
      return { cart: null, error: 'Erreur lors de la mise à jour des informations de livraison' };
    }
  }

  // Convertir le panier en commande (vider le panier après)
  static async convertCartToOrder(userId: string, orderData: any): Promise<{ orderId: string | null; error: string | null }> {
    try {
      console.log('🔄 Conversion du panier en commande pour l\'utilisateur:', userId);
      
      // Récupérer le panier actuel
      const { cart: currentCart } = await this.getCart(userId);
      
      if (!currentCart || currentCart.items.length === 0) {
        console.log('❌ Panier vide, impossible de convertir');
        return { orderId: null, error: 'Le panier est vide' };
      }

      // Importer OrderService dynamiquement pour éviter les dépendances circulaires
      const { OrderService } = await import('./OrderService');

      // Préparer les données de la commande
      const createOrderData = {
        id: generateUUID(),
        user_id: userId,
        business_id: currentCart.business_id,
        business_name: currentCart.business_name,
        items: currentCart.items,
        status: 'pending' as const,
        total: currentCart.total,
        delivery_fee: orderData.totals?.deliveryFee || 0,
        tax: orderData.totals?.tax || 0,
        grand_total: orderData.totals?.total || currentCart.total,
        delivery_address: orderData.delivery?.address || '',
        delivery_method: orderData.delivery?.method || 'delivery',
        estimated_delivery: orderData.delivery?.estimated_delivery || new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes par défaut
        payment_method: orderData.payment?.method || 'cash',
        payment_status: 'pending'
      };

      console.log('📋 Données de commande préparées:', createOrderData);

      // Créer la commande via OrderService
      const { order, error: orderError } = await OrderService.createOrder(createOrderData);
      
      if (orderError || !order) {
        console.error('❌ Erreur lors de la création de la commande:', orderError);
        return { orderId: null, error: orderError || 'Erreur lors de la création de la commande' };
      }

      console.log('✅ Commande créée avec succès:', order.id);

      // Vider le panier après création réussie de la commande
      const { error: clearError } = await this.clearCart(userId);
      
      if (clearError) {
        console.warn('⚠️ Erreur lors du vidage du panier:', clearError);
        // On ne retourne pas d'erreur car la commande a été créée avec succès
      } else {
        console.log('✅ Panier vidé avec succès');
      }
      
      return { orderId: order.id, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la conversion du panier en commande:', error);
      return { orderId: null, error: 'Erreur lors de la conversion du panier en commande' };
    }
  }

  // S'abonner aux changements du panier (temps réel)
  static subscribeToCartChanges(userId: string, callback: (cart: Cart | null) => void) {
    return supabase
      .channel(`cart:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Récupérer le panier mis à jour
          const { cart } = await this.getCart(userId);
          callback(cart);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `cart_id=eq.${userId}`
        },
        async (payload) => {
          // Récupérer le panier mis à jour
          const { cart } = await this.getCart(userId);
          callback(cart);
        }
      )
      .subscribe();
  }
} 