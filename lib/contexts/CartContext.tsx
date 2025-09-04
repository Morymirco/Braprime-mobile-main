import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AddToCartItem, Cart, CartService, LocalCartItem } from '../services/CartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  carts: Cart[];
  currentCart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (item: AddToCartItem, businessId: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncFromLocal: (localItems: LocalCartItem[], businessId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  setCurrentCart: (cart: Cart | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [currentCart, setCurrentCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le panier au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCarts([]);
      setCurrentCart(null);
      setError(null);
    }
  }, [user]);

  // Charger le panier depuis la base de données
  const loadCart = useCallback(async () => {
    if (!user) return;

    console.log('🔄 loadCart appelé pour user:', user.id);
    setLoading(true);
    setError(null);

    try {
      // Récupérer tous les paniers de l'utilisateur (pas de création automatique)
      const { carts: cartData, error: cartError } = await CartService.getAllCarts(user.id);
      
      console.log('📦 Résultat getAllCarts:', { cartData, cartError });
      
      if (cartError) {
        console.error('❌ Erreur cartError:', cartError);
        setError(cartError);
      } else {
        // Stocker tous les paniers et définir le premier comme panier actuel
        console.log('✅ Carts récupérés:', cartData);
        setCarts(cartData);
        
        // Calculer le total global de tous les paniers pour l'affichage dans le header
        const totalItems = cartData.reduce((sum, cart) => sum + (cart.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
        const totalAmount = cartData.reduce((sum, cart) => sum + (cart.total || 0), 0);
        
        // Créer un panier virtuel pour l'affichage global
        const globalCart: Cart = {
          id: 'global',
          user_id: user.id,
          business_id: undefined,
          business_name: 'Multi-services',
          business_delivery_fee: 0,
          delivery_method: 'delivery',
          delivery_address: '',
          delivery_instructions: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: cartData.flatMap(cart => cart.items || []),
          total: totalAmount,
          item_count: totalItems,
          is_multi_service: cartData.length > 1,
          business_count: cartData.length,
          businesses: cartData.map(cart => ({
            id: cart.business_id || 0,
            name: cart.business_name || '',
            item_count: cart.item_count || 0,
            total: cart.total || 0
          }))
        };
        
        setCurrentCart(globalCart);
        console.log('🎯 GlobalCart défini:', globalCart);
      }
    } catch (err) {
      console.error('💥 Erreur catch:', err);
      const errorMessage = 'Erreur lors du chargement du panier';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mettre à jour l'état local du panier après une modification
  const updateLocalCart = useCallback((updatedCart: Cart | null) => {
    if (updatedCart) {
      // Mettre à jour le panier dans la liste des paniers
      setCarts(prevCarts => {
        const updatedCarts = prevCarts.map(cart => 
          cart.id === updatedCart.id ? updatedCart : cart
        );
        return updatedCarts;
      });
      setCurrentCart(updatedCart);
    }
  }, []);

  // Recharger tous les paniers depuis la base de données
  const reloadCarts = useCallback(async () => {
    if (!user) return;
    
    const { carts: newCarts, error } = await CartService.getAllCarts(user.id);
    if (!error && newCarts) {
      setCarts(newCarts);
      
      // Calculer le total global de tous les paniers
      const totalItems = newCarts.reduce((sum, cart) => sum + (cart.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
      const totalAmount = newCarts.reduce((sum, cart) => sum + (cart.total || 0), 0);
      
      // Créer un panier virtuel pour l'affichage global
      const globalCart: Cart = {
        id: 'global',
        user_id: user.id,
        business_id: undefined,
        business_name: 'Multi-services',
        business_delivery_fee: 0,
        delivery_method: 'delivery',
        delivery_address: '',
        delivery_instructions: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: newCarts.flatMap(cart => cart.items || []),
        total: totalAmount,
        item_count: totalItems,
        is_multi_service: newCarts.length > 1,
        business_count: newCarts.length,
        businesses: newCarts.map(cart => ({
          id: cart.business_id || 0,
          name: cart.business_name || '',
          item_count: cart.item_count || 0,
          total: cart.total || 0
        }))
      };
      
      setCurrentCart(globalCart);
    }
  }, [user]);

  // Ajouter un article au panier
  const addToCart = useCallback(async (item: AddToCartItem, businessId: number) => {
    if (!user) {
      setError('Veuillez vous connecter pour ajouter des articles au panier.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { success, error: addError, cart: updatedCart } = await CartService.addToCart(
        user.id,
        item,
        businessId
      );

      if (addError) {
        setError(addError);
      } else if (success) {
        // Recharger tous les paniers pour s'assurer de la cohérence
        await reloadCarts();
        console.log('✅ Article ajouté au panier:', item.name);
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'ajout au panier';
      setError(errorMessage);
      console.error('❌ Erreur dans addToCart:', err);
    } finally {
      setLoading(false);
    }
  }, [user, reloadCarts]);

  // Mettre à jour la quantité d'un article
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user) return;

    // Mise à jour optimiste de l'interface
    setCurrentCart(prevCart => {
      if (!prevCart) return prevCart;
      
      const updatedItems = prevCart.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...prevCart,
        items: updatedItems,
        total: newTotal,
        item_count: newItemCount
      };
    });

    try {
      const { success, error: updateError, cart: updatedCart } = await CartService.updateQuantity(itemId, quantity);

      if (updateError) {
        // En cas d'erreur, recharger le panier pour revenir à l'état correct
        await reloadCarts();
        setError(updateError);
      } else if (success) {
        // Recharger tous les paniers pour s'assurer de la cohérence
        await reloadCarts();
        console.log('✅ Quantité mise à jour:', itemId, '->', quantity);
      }
    } catch (err) {
      // En cas d'erreur, recharger le panier
      await reloadCarts();
      const errorMessage = 'Erreur lors de la mise à jour de la quantité';
      setError(errorMessage);
      console.error('❌ Erreur dans updateQuantity:', err);
    }
  }, [user, reloadCarts]);

  // Supprimer un article du panier
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user) return;

    // Mise à jour optimiste de l'interface
    setCurrentCart(prevCart => {
      if (!prevCart) return prevCart;
      
      const updatedItems = prevCart.items.filter(item => item.id !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...prevCart,
        items: updatedItems,
        total: newTotal,
        item_count: newItemCount
      };
    });

    try {
      const { success, error: removeError, cart: updatedCart } = await CartService.removeFromCart(itemId);

      if (removeError) {
        // En cas d'erreur, recharger le panier
        await reloadCarts();
        setError(removeError);
      } else if (success) {
        // Recharger tous les paniers pour s'assurer de la cohérence
        await reloadCarts();
        console.log('✅ Article supprimé du panier:', itemId);
      }
    } catch (err) {
      // En cas d'erreur, recharger le panier
      await reloadCarts();
      const errorMessage = 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('❌ Erreur dans removeFromCart:', err);
    }
  }, [user, reloadCarts]);

  // Vider le panier
  const clearCart = useCallback(async () => {
    if (!user) return;

    // Mise à jour optimiste
    setCurrentCart(null);

    try {
      const { success, error: clearError, cart: updatedCart } = await CartService.clearCart(user.id);

      if (clearError) {
        // En cas d'erreur, recharger le panier
        await reloadCarts();
        setError(clearError);
      } else if (success) {
        // Recharger tous les paniers pour s'assurer de la cohérence
        await reloadCarts();
        console.log('✅ Panier vidé avec succès');
      }
    } catch (err) {
      // En cas d'erreur, recharger le panier
      await reloadCarts();
      const errorMessage = 'Erreur lors du vidage du panier';
      setError(errorMessage);
      console.error('❌ Erreur dans clearCart:', err);
    }
  }, [user, reloadCarts]);

  // Synchroniser depuis le localStorage
  const syncFromLocal = useCallback(async (
    localItems: LocalCartItem[], 
    businessId: number
  ) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { success, error: syncError } = await CartService.syncFromLocal(
        user.id, 
        localItems, 
        businessId
      );

      if (syncError) {
        setError(syncError);
      } else if (success) {
        // Recharger les paniers après synchronisation
        await reloadCarts();
        console.log('✅ Synchronisation réussie');
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la synchronisation';
      setError(errorMessage);
      console.error('❌ Erreur dans syncFromLocal:', err);
    } finally {
      setLoading(false);
    }
  }, [user, reloadCarts]);

  // Recharger le panier
  const refreshCart = useCallback(async () => {
    await reloadCarts();
  }, [reloadCarts]);

  const value: CartContextType = {
    carts,
    currentCart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncFromLocal,
    refreshCart,
    setCurrentCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};