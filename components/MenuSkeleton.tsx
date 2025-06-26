import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface MenuSkeletonProps {
  categoryCount?: number;
  itemCount?: number;
}

export default function MenuSkeleton({ categoryCount = 3, itemCount = 6 }: MenuSkeletonProps) {
  const animatedValue = new Animated.Value(0);

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
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Catégories */}
      <View style={styles.categoriesContainer}>
        <Animated.View style={[styles.categoryTitle, { opacity }]} />
        <View style={styles.categoriesList}>
          {Array.from({ length: categoryCount }).map((_, index) => (
            <Animated.View key={index} style={[styles.categoryItem, { opacity }]} />
          ))}
        </View>
      </View>

      {/* Articles */}
      <View style={styles.itemsContainer}>
        <Animated.View style={[styles.itemsTitle, { opacity }]} />
        <View style={styles.itemsList}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <View key={index} style={styles.itemCard}>
              <Animated.View style={[styles.itemImage, { opacity }]} />
              <View style={styles.itemContent}>
                <Animated.View style={[styles.itemName, { opacity }]} />
                <Animated.View style={[styles.itemDescription, { opacity }]} />
                <Animated.View style={[styles.itemPrice, { opacity }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
    width: '40%',
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    width: 80,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  itemsTitle: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
    width: '30%',
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
    width: '70%',
  },
  itemDescription: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '50%',
  },
  itemPrice: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 60,
    alignSelf: 'flex-end',
  },
}); 