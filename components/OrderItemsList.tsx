import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  image?: string;
}

interface OrderItemsListProps {
  items: OrderItem[];
  showImages?: boolean;
  compact?: boolean;
}

export default function OrderItemsList({ items, showImages = true, compact = false }: OrderItemsListProps) {
  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="shopping-basket" size={24} color="#ccc" />
        <Text style={styles.emptyText}>Aucun article dans cette commande</Text>
      </View>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {/* En-tête avec le total */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Articles ({items.length})
        </Text>
        <Text style={styles.totalAmount}>
          Total: {totalAmount.toLocaleString()} GNF
        </Text>
      </View>

      {/* Liste des items */}
      <ScrollView 
        style={styles.itemsContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {items.map((item, index) => (
          <View key={item.id || index} style={[styles.itemCard, compact && styles.compactItemCard]}>
            {/* Image de l'article */}
            {showImages && (
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <MaterialIcons name="restaurant" size={20} color="#ccc" />
                  </View>
                )}
              </View>
            )}

            {/* Détails de l'article */}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              
              <View style={styles.itemMeta}>
                <Text style={styles.itemQuantity}>
                  Qté: {item.quantity}
                </Text>
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString()} GNF
                </Text>
              </View>

              {/* Instructions spéciales */}
              {item.specialInstructions && (
                <View style={styles.specialInstructions}>
                  <MaterialIcons name="info-outline" size={14} color="#666" />
                  <Text style={styles.specialInstructionsText} numberOfLines={2}>
                    {item.specialInstructions}
                  </Text>
                </View>
              )}

              {/* Sous-total de l'article */}
              <Text style={styles.itemSubtotal}>
                Sous-total: {(item.price * item.quantity).toLocaleString()} GNF
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Résumé en bas */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Nombre d'articles:</Text>
          <Text style={styles.summaryValue}>{items.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryTotal}>{totalAmount.toLocaleString()} GNF</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactContainer: {
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31837',
  },
  itemsContainer: {
    maxHeight: 300,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  compactItemCard: {
    padding: 8,
    marginBottom: 6,
  },
  imageContainer: {
    marginRight: 12,
    flexShrink: 0,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  specialInstructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    backgroundColor: '#fff3cd',
    padding: 6,
    borderRadius: 6,
  },
  specialInstructionsText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 4,
    flex: 1,
    fontStyle: 'italic',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E31837',
    textAlign: 'right',
  },
  summary: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31837',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
