import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const OrdersPageSkeleton: React.FC = () => {
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
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.backButton, { opacity }]} />
        <Animated.View style={[styles.title, { opacity }]} />
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchContainer}>
        <Animated.View style={[styles.searchInput, { opacity }]} />
        <View style={styles.filterContainer}>
          <Animated.View style={[styles.filterButton, { opacity }]} />
          <Animated.View style={[styles.filterButton, { opacity }]} />
          <Animated.View style={[styles.filterButton, { opacity }]} />
        </View>
      </View>

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          <Animated.View style={[styles.tab, { opacity }]} />
          <Animated.View style={[styles.tab, { opacity }]} />
          <Animated.View style={[styles.tab, { opacity }]} />
          <Animated.View style={[styles.tab, { opacity }]} />
        </View>
      </View>

      {/* Orders List */}
      <View style={styles.ordersList}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Animated.View style={[styles.businessName, { opacity }]} />
                <Animated.View style={[styles.orderId, { opacity }]} />
                <Animated.View style={[styles.orderDate, { opacity }]} />
              </View>
              <Animated.View style={[styles.statusBadge, { opacity }]} />
            </View>

            <View style={styles.orderDetails}>
              <Animated.View style={[styles.orderTotal, { opacity }]} />
              <Animated.View style={[styles.itemsCount, { opacity }]} />
            </View>

            <View style={styles.orderActions}>
              <Animated.View style={[styles.viewButton, { opacity }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  backButton: {
    width: 24,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  title: {
    height: 24,
    width: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginLeft: 12,
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
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    height: 32,
    width: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
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
  businessName: {
    height: 20,
    width: '60%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  orderId: {
    height: 14,
    width: '40%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 2,
  },
  orderDate: {
    height: 14,
    width: '50%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  statusBadge: {
    height: 24,
    width: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderTotal: {
    height: 18,
    width: '40%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  itemsCount: {
    height: 14,
    width: '30%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    height: 32,
    width: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
});

export default OrdersPageSkeleton; 