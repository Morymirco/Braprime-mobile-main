import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface CartSkeletonProps {
  count?: number;
}

export default function CartSkeleton({ count = 3 }: CartSkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View style={[styles.titleSkeleton, { opacity }]} />
          <Animated.View style={[styles.subtitleSkeleton, { opacity }]} />
        </View>
      </View>

      {/* Items skeleton */}
      <View style={styles.itemsContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.itemCard}>
            <Animated.View style={[styles.itemImage, { opacity }]} />
            <View style={styles.itemContent}>
              <Animated.View style={[styles.itemName, { opacity }]} />
              <Animated.View style={[styles.itemDescription, { opacity }]} />
              <View style={styles.itemFooter}>
                <Animated.View style={[styles.itemPrice, { opacity }]} />
                <View style={styles.quantityContainer}>
                  <Animated.View style={[styles.quantityButton, { opacity }]} />
                  <Animated.View style={[styles.quantityText, { opacity }]} />
                  <Animated.View style={[styles.quantityButton, { opacity }]} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Summary skeleton */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Animated.View style={[styles.summaryLabel, { opacity }]} />
          <Animated.View style={[styles.summaryValue, { opacity }]} />
        </View>
        <View style={styles.summaryRow}>
          <Animated.View style={[styles.summaryLabel, { opacity }]} />
          <Animated.View style={[styles.summaryValue, { opacity }]} />
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Animated.View style={[styles.totalLabel, { opacity }]} />
          <Animated.View style={[styles.totalValue, { opacity }]} />
        </View>
      </View>

      {/* Button skeleton */}
      <View style={styles.buttonContainer}>
        <Animated.View style={[styles.checkoutButton, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  headerContent: {
    gap: 8,
  },
  titleSkeleton: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '60%',
  },
  subtitleSkeleton: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '40%',
  },
  itemsContainer: {
    gap: 8,
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '80%',
  },
  itemDescription: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '60%',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: 60,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
  },
  quantityText: {
    width: 20,
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '30%',
  },
  summaryValue: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '20%',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  totalLabel: {
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '25%',
  },
  totalValue: {
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '25%',
  },
  buttonContainer: {
    padding: 16,
    marginTop: 16,
  },
  checkoutButton: {
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
}); 