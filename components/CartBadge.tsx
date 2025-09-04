import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCartContext } from '../lib/contexts/CartContext';

interface CartBadgeProps {
  style?: any;
  textStyle?: any;
  showZero?: boolean;
}

export const CartBadge: React.FC<CartBadgeProps> = ({
  style,
  textStyle,
  showZero = false,
}) => {
  const { currentCart } = useCartContext();

  // Calculer la quantité totale d'articles (pas le nombre d'articles uniques)
  const totalQuantity = currentCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (!showZero && totalQuantity === 0) {
    return null;
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.badgeText, textStyle]}>
        {totalQuantity > 99 ? '99+' : totalQuantity.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#E31837',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CartBadge;
