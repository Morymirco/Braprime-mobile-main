import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { AddToCartItem, Cart, CartService } from '../lib/services/CartService';

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le panier au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { cart: cartData, error: cartError } = await CartService.getCart(user.id);
      
      if (cartError) {
        setError(cartError);
      } else {
        setCart(cartData);
      }
    } catch (err) {
      setError('Erreur lors du chargement du panier');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    item: AddToCartItem, 
    businessId: number, 
    businessName: string
  ) => {
    if (!user) {
      setError('Vous devez être connecté pour ajouter au panier');
      return { success: false };
    }

    try {
      setError(null);
      const { success, error: addError } = await CartService.addToCart(
        user.id, 
        item, 
        businessId, 
        businessName
      );

      if (addError) {
        setError(addError);
        return { success: false };
      }

      // Recharger le panier après ajout
      await loadCart();
      return { success: true };
    } catch (err) {
      setError('Erreur lors de l\'ajout au panier');
      return { success: false };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return { success: false };

    try {
      setError(null);
      const { success, error: updateError } = await CartService.updateQuantity(itemId, quantity);

      if (updateError) {
        setError(updateError);
        return { success: false };
      }

      // Recharger le panier après mise à jour
      await loadCart();
      return { success: true };
    } catch (err) {
      setError('Erreur lors de la mise à jour de la quantité');
      return { success: false };
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return { success: false };

    try {
      setError(null);
      const { success, error: removeError } = await CartService.removeFromCart(itemId);

      if (removeError) {
        setError(removeError);
        return { success: false };
      }

      // Recharger le panier après suppression
      await loadCart();
      return { success: true };
    } catch (err) {
      setError('Erreur lors de la suppression de l\'article');
      return { success: false };
    }
  };

  const clearCart = async () => {
    if (!user) return { success: false };

    try {
      setError(null);
      const { success, error: clearError } = await CartService.clearCart(user.id);

      if (clearError) {
        setError(clearError);
        return { success: false };
      }

      setCart(null);
      return { success: true };
    } catch (err) {
      setError('Erreur lors du vidage du panier');
      return { success: false };
    }
  };

  const updateDeliveryInfo = async (
    deliveryMethod: 'delivery' | 'pickup', 
    deliveryAddress?: string, 
    deliveryInstructions?: string
  ) => {
    if (!user) return { success: false };

    try {
      setError(null);
      const { cart: updatedCart, error: updateError } = await CartService.updateDeliveryInfo(
        user.id, 
        deliveryMethod, 
        deliveryAddress, 
        deliveryInstructions
      );

      if (updateError) {
        setError(updateError);
        return { success: false };
      }

      setCart(updatedCart);
      return { success: true };
    } catch (err) {
      setError('Erreur lors de la mise à jour des informations de livraison');
      return { success: false };
    }
  };

  const convertToOrder = async (orderData: any) => {
    if (!user) return { success: false };

    try {
      setError(null);
      const { orderId, error: orderError } = await CartService.convertCartToOrder(user.id, orderData);

      if (orderError) {
        setError(orderError);
        return { success: false, orderId: null };
      }

      setCart(null);
      return { success: true, orderId };
    } catch (err) {
      setError('Erreur lors de la conversion en commande');
      return { success: false, orderId: null };
    }
  };

  // Calculer le total des articles
  const getItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculer le total du panier
  const getTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Vérifier si le panier est vide
  const isEmpty = () => {
    return !cart || cart.items.length === 0;
  };

  return {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    updateDeliveryInfo,
    convertToOrder,
    loadCart,
    getItemCount,
    getTotal,
    isEmpty
  };
} 