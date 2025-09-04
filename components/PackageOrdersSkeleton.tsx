import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonLoader, SkeletonOrderCard } from './SkeletonLoader';

const PackageOrdersSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Filtres skeleton */}
      <View style={styles.filtersContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonLoader key={index} height={32} width={80} borderRadius={16} style={styles.filterSkeleton} />
        ))}
      </View>
      
      {/* Liste des colis skeleton */}
      <View style={styles.ordersList}>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonOrderCard key={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterSkeleton: {
    marginRight: 8,
  },
  ordersList: {
    flex: 1,
  },
});

export default PackageOrdersSkeleton;
