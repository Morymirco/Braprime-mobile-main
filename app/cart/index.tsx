import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight: string;
}

const initialItems: CartItem[] = [
  {
    id: '1',
    name: 'Cheese Croissant',
    price: 85000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=200',
    weight: '80G'
  },
  {
    id: '2',
    name: 'Chocolate Croissant',
    price: 85000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?q=80&w=200',
    weight: '80G'
  },
  {
    id: '3',
    name: 'Qbake Sandwich Roll White',
    price: 25000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200',
    weight: '50G 4Pcs.'
  },
  {
    id: '4',
    name: 'Qbake Cream Roll Vanilla',
    price: 20000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200',
    weight: '45G'
  },
  {
    id: '5',
    name: 'Santa Maria Tortilla Original',
    price: 150000,
    quantity: 5,
    image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=200',
    weight: '320G'
  }
];

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
  const deliveryFee = 15000;

  const updateQuantity = (id: string, increment: boolean) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: increment ? item.quantity + 1 : Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const calculateTotal = () => {
    const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return itemsTotal + deliveryFee;
  };

  const formatPrice = (price: number) => {
    return `${(price).toLocaleString('fr-GN')} GNF`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <Ionicons name="home-outline" size={24} color="black" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Home</Text>
              <Text style={styles.addressText}>Rue KA 028, Quartier Almamya</Text>
              <Text style={styles.addressSubtext}>Kaloum, Conakry</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </View>
        </View>

        <View style={styles.timeSection}>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={24} color="black" />
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>Today at 5:15 pm</Text>
              <Text style={styles.timeSubtext}>Tap to schedule order</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </View>
        </View>

        <View style={styles.vendorSection}>
         
          <Text style={styles.storeName}>Cart</Text>
          <TouchableOpacity style={styles.addMoreButton}>
            <Text style={styles.addMoreText}>Add more</Text>
          </TouchableOpacity>
        </View>

        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemWeight}>{item.weight}</Text>
              <TouchableOpacity style={styles.specialRequest}>
                <Ionicons name="chatbubble-outline" size={16} color="gray" />
                <Text style={styles.specialRequestText}>Add Special Request</Text>
              </TouchableOpacity>
              <View style={styles.priceQuantityRow}>
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, false)}>
                    <Text style={styles.quantityButton}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, true)}>
                    <Text style={styles.quantityButton}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.voucherButton}>
          <Ionicons name="ticket-outline" size={24} color="black" />
          <Text style={styles.voucherText}>Apply Voucher</Text>
          <Text style={styles.voucherCount}>1 available</Text>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>{formatPrice(deliveryFee)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(calculateTotal())}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Go to Checkout</Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  addressSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addressSubtext: {
    fontSize: 14,
    color: '#666',
  },
  timeSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  vendorSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  addMoreButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  addMoreText: {
    color: '#007AFF',
    fontSize: 16,
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 12,
    flexDirection: 'row',
    marginBottom: 1,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemWeight: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  specialRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  specialRequestText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 13,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  quantityButton: {
    fontSize: 18,
    paddingHorizontal: 10,
    color: '#666',
  },
  quantity: {
    fontSize: 15,
    marginHorizontal: 10,
  },
  voucherButton: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  voucherText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  voucherCount: {
    color: '#007AFF',
    marginRight: 8,
  },
  totalSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkoutButton: {
    backgroundColor: '#E31837',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
}); 