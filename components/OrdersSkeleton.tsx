import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface OrdersSkeletonProps {
  count?: number;
}

const OrdersSkeleton: React.FC<OrdersSkeletonProps> = ({ count = 3 }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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

  const renderSkeletonItem = () => (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      {/* Header */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBusinessName} />
        <View style={styles.skeletonStatus} />
      </View>

      {/* Date */}
      <View style={styles.skeletonDate} />

      {/* Total */}
      <View style={styles.skeletonTotal} />

      {/* Items */}
      <View style={styles.skeletonItems}>
        <View style={styles.skeletonItem} />
        <View style={styles.skeletonItem} />
        <View style={[styles.skeletonItem, { width: '60%' }]} />
      </View>

      {/* Actions */}
      <View style={styles.skeletonActions}>
        <View style={styles.skeletonButton} />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItemContainer}>
          {renderSkeletonItem()}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  skeletonItemContainer: {
    marginBottom: 1,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skeletonBusinessName: {
    height: 20,
    width: '60%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonStatus: {
    height: 16,
    width: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonDate: {
    height: 14,
    width: '40%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTotal: {
    height: 18,
    width: '30%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonItems: {
    marginBottom: 12,
  },
  skeletonItem: {
    height: 14,
    width: '80%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skeletonButton: {
    height: 32,
    width: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
});

export default OrdersSkeleton; 