import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ReservationsSkeletonProps {
  count?: number;
}

export default function ReservationsSkeleton({ count = 3 }: ReservationsSkeletonProps) {
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

  return (
    <View style={styles.container}>
      {/* Search and Filter Skeleton */}
      <View style={styles.searchContainer}>
        <Animated.View style={[styles.searchInput, { opacity }]} />
        <View style={styles.filterContainer}>
          <Animated.View style={[styles.filterButton, { opacity }]} />
          <Animated.View style={[styles.filterButton, { opacity }]} />
          <Animated.View style={[styles.filterButton, { opacity }]} />
        </View>
      </View>

      {/* Reservations List */}
      <View style={styles.reservationsList}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.reservationCard}>
            <View style={styles.reservationHeader}>
              <View style={styles.businessInfo}>
                <Animated.View style={[styles.businessImage, { opacity }]} />
                <View style={styles.businessDetails}>
                  <Animated.View style={[styles.businessName, { opacity }]} />
                  <Animated.View style={[styles.reservationDate, { opacity }]} />
                  <Animated.View style={[styles.partySize, { opacity }]} />
                </View>
              </View>
              <Animated.View style={[styles.statusBadge, { opacity }]} />
            </View>

            <View style={styles.reservationActions}>
              <Animated.View style={[styles.viewButton, { opacity }]} />
              <Animated.View style={[styles.cancelButton, { opacity }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  reservationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  reservationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    height: 18,
    width: '80%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  reservationDate: {
    height: 14,
    width: '60%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 2,
  },
  partySize: {
    height: 13,
    width: '40%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  statusBadge: {
    height: 24,
    width: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  reservationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    height: 32,
    width: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  cancelButton: {
    height: 32,
    width: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
}); 