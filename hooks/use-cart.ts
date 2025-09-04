import { useCallback } from 'react';
import { useCartContext } from '../lib/contexts/CartContext';
import { AddToCartItem } from '../lib/services/CartService';
import { orderService, type OrderData } from '../lib/services/OrderService';

export function useCart() {
  const cartContext = useCartContext();
  
  // États de chargement individuels pour la compatibilité
  const loadingStates = {
    addToCart: cartContext.loading,
    updateQuantity: {} as { [itemId: string]: boolean },
    removeFromCart: {} as { [itemId: string]: boolean },
    clearCart: cartContext.loading,
    convertToOrder: false,
  };

  // Méthodes pour la compatibilité avec checkout.tsx
  const addToCart = useCallback(async (item: AddToCartItem, businessId: number, businessName: string) => {
    try {
      console.log('🛒 Ajout au panier:', item.name, 'pour business:', businessName);
      await cartContext.addToCart(item, businessId);
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout au panier';
      console.error('❌ Erreur dans addToCart:', err);
      return { success: false, error: errorMessage };
    }
  }, [cartContext]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      console.log('🔄 Mise à jour quantité:', itemId, '->', quantity);
      await cartContext.updateQuantity(itemId, quantity);
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      console.error('❌ Erreur dans updateQuantity:', err);
      return { success: false, error: errorMessage };
    }
  }, [cartContext]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      console.log('🗑️ Suppression article:', itemId);
      await cartContext.removeFromCart(itemId);
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      console.error('❌ Erreur dans removeFromCart:', err);
      return { success: false, error: errorMessage };
    }
  }, [cartContext]);

  const clearCart = useCallback(async () => {
    try {
      console.log('🧹 Vidage du panier');
      await cartContext.clearCart();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du vidage';
      console.error('❌ Erreur dans clearCart:', err);
      return { success: false, error: errorMessage };
    }
  }, [cartContext]);

  const convertToOrder = useCallback(async (orderData: OrderData, cart?: any) => {
    try {
      console.log('🛒 Conversion du panier en commande avec les données:', orderData);
      
      // Utiliser le service de commandes
      const { orderId, error: orderError } = await orderService.createOrder(orderData, cart || cartContext.currentCart);
      
      if (orderId) {
        // Vider le panier après conversion réussie
        await cartContext.clearCart();
        console.log('✅ Conversion réussie, panier vidé, commande créée:', orderId);
        return { success: true, orderId };
      } else {
        console.error('❌ Erreur lors de la création de la commande:', orderError);
        return { success: false, error: orderError || 'Erreur lors de la création de la commande' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la conversion';
      console.error('❌ Erreur dans convertToOrder:', err);
      return { success: false, error: errorMessage };
    }
  }, [cartContext]);

  // Fonctions utilitaires
  const isEmpty = useCallback(() => {
    return !cartContext.currentCart || !cartContext.currentCart.items || cartContext.currentCart.items.length === 0;
  }, [cartContext.currentCart]);

  const getItemCount = useCallback(() => {
    if (!cartContext.currentCart || !cartContext.currentCart.items) return 0;
    return cartContext.currentCart.items.reduce((total, item) => total + item.quantity, 0);
  }, [cartContext.currentCart]);

  const getTotal = useCallback(() => {
    if (!cartContext.currentCart || !cartContext.currentCart.items) return 0;
    return cartContext.currentCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartContext.currentCart]);

  const refetch = useCallback(async () => {
    await cartContext.refreshCart();
  }, [cartContext]);

  // Calculer le total global de tous les paniers
  const totalItems = cartContext.carts.reduce((sum, cart) => sum + (cart.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
  const totalAmount = cartContext.carts.reduce((sum, cart) => sum + (cart.total || 0), 0);

  return {
    cart: cartContext.currentCart, // Alias pour compatibilité
    currentCart: cartContext.currentCart,
    carts: cartContext.carts,
    loading: cartContext.loading,
    error: cartContext.error,
    totalItems,
    totalAmount,
    loadCarts: cartContext.refreshCart,
    reloadCarts: cartContext.refreshCart,
    updateLocalCart: cartContext.setCurrentCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    convertToOrder,
    refetch,
    isEmpty,
    getItemCount,
    getTotal,
    loadingStates,
    clearError: () => {} // Le contexte gère déjà les erreurs
  };
}
