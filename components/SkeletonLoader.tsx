import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  children
}) => {
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

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f5f5f5', '#e8e8e8'],
  });

  if (children) {
    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.skeleton,
            {
              width,
              height,
              borderRadius,
              backgroundColor,
            },
          ]}
        />
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Composants skeleton prédéfinis pour différents cas d'usage
export const SkeletonText: React.FC<{ lines?: number; width?: string | number }> = ({ 
  lines = 1, 
  width = '100%' 
}) => (
  <View style={styles.textContainer}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        height={16}
        width={index === lines - 1 ? '80%' : width}
        style={[styles.textLine, index < lines - 1 && styles.textLineMargin]}
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC = () => (
  <View style={styles.cardContainer}>
    <SkeletonLoader height={120} borderRadius={8} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <SkeletonLoader height={20} width="70%" style={styles.cardTitle} />
      <SkeletonText lines={2} width="100%" />
      <SkeletonLoader height={16} width="40%" style={styles.cardPrice} />
    </View>
  </View>
);

export const SkeletonBusinessCard: React.FC = () => (
  <View style={styles.businessCardContainer}>
    <SkeletonLoader height={100} borderRadius={8} style={styles.businessImage} />
    <View style={styles.businessContent}>
      <SkeletonLoader height={18} width="80%" style={styles.businessName} />
      <SkeletonLoader height={14} width="60%" style={styles.businessCategory} />
      <SkeletonLoader height={14} width="40%" style={styles.businessRating} />
    </View>
  </View>
);

export const SkeletonOrderCard: React.FC = () => (
  <View style={styles.orderCardContainer}>
    <View style={styles.orderHeader}>
      <View style={styles.orderInfo}>
        <SkeletonLoader height={16} width="70%" style={styles.businessNameSkeleton} />
        <SkeletonLoader height={13} width="50%" style={styles.orderDateSkeleton} />
        <SkeletonLoader height={13} width="40%" style={styles.orderDateSkeleton} />
      </View>
      <SkeletonLoader height={24} width={60} borderRadius={12} style={styles.statusBadgeSkeleton} />
    </View>
    <View style={styles.orderDetails}>
      <SkeletonLoader height={15} width="60%" style={styles.orderTotalSkeleton} />
      <SkeletonLoader height={13} width="80%" style={styles.orderItemsSkeleton} />
    </View>
    <View style={styles.orderFooter}>
      <SkeletonLoader height={14} width="40%" />
      <SkeletonLoader height={14} width="25%" />
    </View>
  </View>
);

export const SkeletonProfileStats: React.FC = () => (
  <View style={styles.statsContainer}>
    {Array.from({ length: 3 }).map((_, index) => (
      <View key={index} style={styles.statCard}>
        <SkeletonLoader height={24} width={24} borderRadius={12} />
        <SkeletonLoader height={16} width="60%" style={styles.statNumber} />
        <SkeletonLoader height={12} width="80%" style={styles.statLabel} />
      </View>
    ))}
  </View>
);

export const SkeletonMenuItem: React.FC = () => (
  <View style={styles.menuItemContainer}>
    <SkeletonLoader height={80} width={80} borderRadius={8} style={styles.menuItemImage} />
    <View style={styles.menuItemContent}>
      <SkeletonLoader height={16} width="70%" style={styles.menuItemName} />
      <SkeletonText lines={2} width="100%" />
      <SkeletonLoader height={14} width="30%" style={styles.menuItemPrice} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  skeleton: {
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    flex: 1,
  },
  textLine: {
    marginBottom: 4,
  },
  textLineMargin: {
    marginBottom: 8,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardPrice: {
    marginTop: 8,
  },
  businessCardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessImage: {
    width: 100,
    marginRight: 12,
  },
  businessContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  businessName: {
    marginBottom: 4,
  },
  businessCategory: {
    marginBottom: 4,
  },
  businessRating: {
    marginTop: 4,
  },
  orderCardContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  businessNameSkeleton: {
    marginBottom: 4,
  },
  orderDateSkeleton: {
    marginBottom: 2,
  },
  statusBadgeSkeleton: {
    marginLeft: 8,
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderTotalSkeleton: {
    marginBottom: 4,
  },
  orderItemsSkeleton: {
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  menuItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemName: {
    marginBottom: 4,
  },
  menuItemPrice: {
    marginTop: 8,
  },
});
