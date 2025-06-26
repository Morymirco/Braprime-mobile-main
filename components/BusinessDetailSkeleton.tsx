import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function BusinessDetailSkeleton() {
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
      {/* Image de couverture */}
      <Animated.View style={[styles.coverImage, { opacity }]} />

      {/* Informations principales */}
      <View style={styles.mainInfo}>
        <Animated.View style={[styles.businessName, { opacity }]} />
        <Animated.View style={[styles.description, { opacity }]} />
        <Animated.View style={[styles.description, { opacity, width: '70%' }]} />
        
        <View style={styles.typeContainer}>
          <Animated.View style={[styles.typeBadge, { opacity }]} />
        </View>

        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Animated.View key={index} style={[styles.star, { opacity }]} />
            ))}
          </View>
          <Animated.View style={[styles.ratingText, { opacity }]} />
        </View>
      </View>

      {/* Actions principales */}
      <View style={styles.actionsContainer}>
        <Animated.View style={[styles.actionButton, { opacity }]} />
      </View>

      {/* Section Menu */}
      <View style={styles.menuSection}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        
        {/* Catégories */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesContent}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Animated.View key={index} style={[styles.categoryButton, { opacity }]} />
            ))}
          </View>
        </View>

        {/* Articles du menu */}
        <View style={styles.menuItemsContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.menuItemCard}>
              <Animated.View style={[styles.menuItemImage, { opacity }]} />
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemHeader}>
                  <Animated.View style={[styles.menuItemName, { opacity }]} />
                  <Animated.View style={[styles.popularBadge, { opacity }]} />
                </View>
                
                <Animated.View style={[styles.menuItemDescription, { opacity }]} />
                <Animated.View style={[styles.menuItemDescription, { opacity, width: '60%' }]} />
                
                <View style={styles.menuItemFooter}>
                  <Animated.View style={[styles.menuItemPrice, { opacity }]} />
                  <Animated.View style={[styles.addButton, { opacity }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Informations de contact */}
      <View style={styles.contactSection}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.contactItem}>
            <Animated.View style={[styles.contactIcon, { opacity }]} />
            <Animated.View style={[styles.contactText, { opacity }]} />
          </View>
        ))}
      </View>

      {/* Informations de livraison */}
      <View style={styles.deliverySection}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        
        {Array.from({ length: 2 }).map((_, index) => (
          <View key={index} style={styles.deliveryItem}>
            <Animated.View style={[styles.deliveryIcon, { opacity }]} />
            <Animated.View style={[styles.deliveryText, { opacity }]} />
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
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  mainInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  businessName: {
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  description: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  typeContainer: {
    marginBottom: 12,
  },
  typeBadge: {
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    width: 100,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    width: 16,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 2,
  },
  ratingText: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 80,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  menuSection: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
    marginHorizontal: 16,
    marginTop: 16,
    width: '40%',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  categoryButton: {
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    width: 80,
    marginRight: 8,
  },
  menuItemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  menuItemName: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  popularBadge: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    width: 60,
  },
  menuItemDescription: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
    width: '100%',
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 80,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  contactSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginRight: 12,
  },
  contactText: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    flex: 1,
  },
  deliverySection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginRight: 12,
  },
  deliveryText: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    flex: 1,
  },
}); 