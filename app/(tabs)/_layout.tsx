import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useCart } from '../../hooks/use-cart';
import { AuthGuard } from '../../lib/components/AuthGuard';
import { useI18n } from '../../lib/contexts/I18nContext';

// Composant pour l'icône du panier avec badge
function CartIconWithBadge({ color }: { color: string }) {
  const { currentCart } = useCart();
  
  // Calculer la quantité totale d'articles (pas le nombre d'articles uniques)
  const totalQuantity = currentCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  return (
    <View style={styles.iconContainer}>
      <MaterialIcons name="shopping-cart" size={24} color={color} />
      {totalQuantity > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalQuantity > 99 ? '99+' : totalQuantity}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { t, isRTL } = useI18n();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#E31837',
          tabBarInactiveTintColor: '#666666',
          tabBarLabelStyle: {
            fontSize: 12,
          },
          // Support RTL
          tabBarStyle: {
            direction: isRTL ? 'rtl' : 'ltr',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('navigation.home'),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: t('navigation.services'),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="grid-view" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: t('navigation.cart'),
            tabBarIcon: ({ color }) => (
              <CartIconWithBadge color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('navigation.profile'),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="person" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E31837',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
