import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { AddToCartItem, Cart, CartService } from '../lib/services/CartService';
import { useDataSync } from './useDataSync';

interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (item: AddToCartItem, businessId: number, businessName: string) => Promise<{ success: boolean; error: string | null }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<{ success: boolean; error: string | null }>;
  removeFromCart: (itemId: string) => Promise<{ success: boolean; error: string | null }>;
  clearCart: () => Promise<{ success: boolean; error: string | null }>;
  convertToOrder: (orderData: any) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  refetch: () => Promise<void>;
  isEmpty: () => boolean;
  getItemCount: () => number;
  getTotal: () => number;
  // États de chargement individuels
  loadingStates: {
    addToCart: boolean;
    updateQuantity: { [itemId: string]: boolean };
    removeFromCart: { [itemId: string]: boolean };
    clearCart: boolean;
    convertToOrder: boolean;
  };
}

export function useCart(): UseCartReturn {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États de chargement individuels
  const [loadingStates, setLoadingStates] = useState({
    addToCart: false,
    updateQuantity: {} as { [itemId: string]: boolean },
    removeFromCart: {} as { [itemId: string]: boolean },
    clearCart: false,
    convertToOrder: false,
  });

  // Référence pour éviter les requêtes en double
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const CACHE_DURATION = 5000; // 5 secondes

  // Système de synchronisation
  const { registerSync, unregisterSync, forceSync } = useDataSync({
    enabled: true,
    interval: 30000, // 30 secondes
    retryAttempts: 3,
    retryDelay: 5000,
  });

  const fetchCart = useCallback(async (force = false) => {
    if (!user?.id) {
      setCart(null);
      setLoading(false);
      return;
    }

    const now = Date.now();
    if (!force && fetchingRef.current) {
      console.log('🔄 Fetch déjà en cours, ignoré');
      return;
    }

    if (!force && now - lastFetchTimeRef.current < CACHE_DURATION) {
      console.log('⏱️ Cache encore valide, ignoré');
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('🔄 Récupération du panier...');
      const { cart: cartData, error: cartError } = await CartService.getCart(user.id);
      
      if (cartError) {
        setError(cartError);
        console.error('❌ Erreur panier:', cartError);
      } else {
        setCart(cartData);
        console.log('✅ Panier récupéré:', cartData?.items?.length || 0, 'articles');
      }
      
      lastFetchTimeRef.current = now;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du panier';
      setError(errorMessage);
      console.error('❌ Erreur dans fetchCart:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]);

  // Mise à jour optimiste du panier local
  const updateCartOptimistically = useCallback((updater: (cart: Cart | null) => Cart | null) => {
    setCart(prevCart => {
      const newCart = updater(prevCart);
      console.log('🔄 Mise à jour optimiste du panier');
      return newCart;
    });
  }, []);

  const addToCart = useCallback(async (item: AddToCartItem, businessId: number, businessName: string) => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    setLoadingStates(prev => ({ ...prev, addToCart: true }));

    try {
      console.log('🛒 Ajout au panier:', item.name);
      
      // Mise à jour optimiste
      updateCartOptimistically(prevCart => {
        if (!prevCart) {
          return {
            id: 'temp',
            user_id: user.id,
            business_id: businessId,
            business_name: businessName,
            items: [{ ...item, id: 'temp-' + Date.now(), quantity: 1 }],
            delivery_fee: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }

        const existingItemIndex = prevCart.items.findIndex(
          cartItem => cartItem.menu_item_id === item.menu_item_id
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...prevCart.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1
          };
          return { ...prevCart, items: updatedItems };
        } else {
          return {
            ...prevCart,
            items: [...prevCart.items, { ...item, id: 'temp-' + Date.now(), quantity: 1 }]
          };
        }
      });

      const result = await CartService.addToCart(user.id, item, businessId, businessName);
      
      if (result.success) {
        // Synchroniser avec le serveur
        await fetchCart(true);
        console.log('✅ Article ajouté avec succès');
      } else {
        // Annuler la mise à jour optimiste en cas d'erreur
        await fetchCart(true);
        console.error('❌ Erreur lors de l\'ajout:', result.error);
      }
      
      return result;
    } catch (err) {
      // Annuler la mise à jour optimiste en cas d'erreur
      await fetchCart(true);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout au panier';
      console.error('❌ Erreur dans addToCart:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, addToCart: false }));
    }
  }, [user?.id, fetchCart, updateCartOptimistically]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    setLoadingStates(prev => ({
      ...prev,
      updateQuantity: { ...prev.updateQuantity, [itemId]: true }
    }));

    try {
      console.log('📝 Mise à jour quantité:', itemId, '->', quantity);
      
      // Mise à jour optimiste
      updateCartOptimistically(prevCart => {
        if (!prevCart) return null;
        
        const updatedItems = prevCart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        
        return { ...prevCart, items: updatedItems };
      });

      const result = await CartService.updateQuantity(itemId, quantity);
      
      if (result.success) {
        // Synchroniser avec le serveur
        await fetchCart(true);
        console.log('✅ Quantité mise à jour avec succès');
      } else {
        // Annuler la mise à jour optimiste en cas d'erreur
        await fetchCart(true);
        console.error('❌ Erreur lors de la mise à jour:', result.error);
      }
      
      return result;
    } catch (err) {
      // Annuler la mise à jour optimiste en cas d'erreur
      await fetchCart(true);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la quantité';
      console.error('❌ Erreur dans updateQuantity:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        updateQuantity: { ...prev.updateQuantity, [itemId]: false }
      }));
    }
  }, [user?.id, fetchCart, updateCartOptimistically]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    setLoadingStates(prev => ({
      ...prev,
      removeFromCart: { ...prev.removeFromCart, [itemId]: true }
    }));

    try {
      console.log('🗑️ Suppression du panier:', itemId);
      
      // Mise à jour optimiste
      updateCartOptimistically(prevCart => {
        if (!prevCart) return null;
        
        const updatedItems = prevCart.items.filter(item => item.id !== itemId);
        
        if (updatedItems.length === 0) {
          return null; // Panier vide
        }
        
        return { ...prevCart, items: updatedItems };
      });

      const result = await CartService.removeFromCart(itemId);
      
      if (result.success) {
        // Synchroniser avec le serveur
        await fetchCart(true);
        console.log('✅ Article supprimé avec succès');
      } else {
        // Annuler la mise à jour optimiste en cas d'erreur
        await fetchCart(true);
        console.error('❌ Erreur lors de la suppression:', result.error);
      }
      
      return result;
    } catch (err) {
      // Annuler la mise à jour optimiste en cas d'erreur
      await fetchCart(true);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      console.error('❌ Erreur dans removeFromCart:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        removeFromCart: { ...prev.removeFromCart, [itemId]: false }
      }));
    }
  }, [user?.id, fetchCart, updateCartOptimistically]);

  const clearCart = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    setLoadingStates(prev => ({ ...prev, clearCart: true }));

    try {
      console.log('🧹 Vidage du panier');
      
      // Mise à jour optimiste
      updateCartOptimistically(() => null);

      const result = await CartService.clearCart(user.id);
      
      if (result.success) {
        console.log('✅ Panier vidé avec succès');
      } else {
        // Annuler la mise à jour optimiste en cas d'erreur
        await fetchCart(true);
        console.error('❌ Erreur lors du vidage:', result.error);
      }
      
      return result;
    } catch (err) {
      // Annuler la mise à jour optimiste en cas d'erreur
      await fetchCart(true);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du vidage du panier';
      console.error('❌ Erreur dans clearCart:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, clearCart: false }));
    }
  }, [user?.id, fetchCart, updateCartOptimistically]);

  const convertToOrder = useCallback(async (orderData: any) => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    setLoadingStates(prev => ({ ...prev, convertToOrder: true }));

    try {
      console.log('🛒 Conversion du panier en commande');
      
      const result = await CartService.convertCartToOrder(user.id, orderData);
      
      if (result.orderId) {
        // Vider le panier local après conversion réussie
        setCart(null);
        console.log('✅ Conversion réussie, panier vidé');
        return { success: true, orderId: result.orderId };
      } else {
        console.error('❌ Erreur lors de la conversion:', result.error);
        return { success: false, error: result.error || 'Erreur lors de la conversion' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la conversion';
      console.error('❌ Erreur dans convertToOrder:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, convertToOrder: false }));
    }
  }, [user?.id]);

  // Fonctions utilitaires
  const isEmpty = useCallback(() => {
    return !cart || !cart.items || cart.items.length === 0;
  }, [cart]);

  const getItemCount = useCallback(() => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotal = useCallback(() => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // Synchronisation automatique
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Enregistrement de la synchronisation du panier
  useEffect(() => {
    if (user?.id) {
      registerSync('cart-sync', fetchCart, 'high');
      
      return () => {
        unregisterSync('cart-sync');
      };
    }
  }, [user?.id, registerSync, unregisterSync, fetchCart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    convertToOrder,
    refetch: () => fetchCart(true),
    isEmpty,
    getItemCount,
    getTotal,
    loadingStates,
  };
} 