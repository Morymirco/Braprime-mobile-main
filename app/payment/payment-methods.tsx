import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentCard {
  id: string;
  lastFourDigits: string;
  expiryDate: string;
  type: 'debit' | 'credit';
}

export default function PaymentMethods() {
  const router = useRouter();
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: '1',
      lastFourDigits: '0687',
      expiryDate: '12/27',
      type: 'debit'
    }
  ]);

  const deleteCard = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Payment Cards</Text>
      </View>

      {/* Cards List */}
      <View style={styles.cardsList}>
        {cards.map(card => (
          <View key={card.id} style={styles.cardItem}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNumber}>
                **** **** **** {card.lastFourDigits}
              </Text>
              <Text style={styles.cardExpiry}>
                {card.type} {card.expiryDate}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => deleteCard(card.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete Card</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add New Card Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/payment/add-card')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardsList: {
    flex: 1,
    padding: 16,
  },
  cardItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInfo: {
    marginBottom: 16,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardExpiry: {
    fontSize: 16,
    color: '#666',
  },
  deleteButton: {
    alignSelf: 'flex-end',
  },
  deleteText: {
    color: '#E41E31',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  addButton: {
    backgroundColor: '#E41E31',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '600',
  },
  curatedText: {
    fontSize: 16,
    color: '#666',
  },
}); 