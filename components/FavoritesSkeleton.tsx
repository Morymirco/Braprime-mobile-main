import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

interface FavoritesSkeletonProps {
  businessCount?: number;
  itemCount?: number;
}

export default function FavoritesSkeleton({ 
  businessCount = 3, 
  itemCount = 6 
}: FavoritesSkeletonProps) {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <View style={styles.headerTitleSkeleton} />
        <View style={styles.headerSubtitleSkeleton} />
      </View>

      {/* Tabs skeleton */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabSkeleton} />
        <View style={styles.tabSkeleton} />
      </View>

      {/* Content skeleton */}
      <View style={styles.content}>
        {/* Businesses skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionTitleSkeleton} />
          {Array.from({ length: businessCount }).map((_, index) => (
            <View key={`business-${index}`} style={styles.businessCardSkeleton}>
              <View style={styles.businessImageSkeleton} />
              <View style={styles.businessContentSkeleton}>
                <View style={styles.businessNameSkeleton} />
                <View style={styles.businessDescriptionSkeleton} />
                <View style={styles.businessMetaSkeleton}>
                  <View style={styles.businessRatingSkeleton} />
                  <View style={styles.businessPriceSkeleton} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Menu items skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionTitleSkeleton} />
          {Array.from({ length: itemCount }).map((_, index) => (
            <View key={`item-${index}`} style={styles.itemCardSkeleton}>
              <View style={styles.itemImageSkeleton} />
              <View style={styles.itemContentSkeleton}>
                <View style={styles.itemNameSkeleton} />
                <View style={styles.itemDescriptionSkeleton} />
                <View style={styles.itemFooterSkeleton}>
                  <View style={styles.itemPriceSkeleton} />
                  <View style={styles.itemActionsSkeleton} />
                </View>
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
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitleSkeleton: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
    marginBottom: 8,
  },
  headerSubtitleSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '40%',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabSkeleton: {
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    width: 80,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitleSkeleton: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '30%',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  businessCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  businessImageSkeleton: {
    width: 80,
    height: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 12,
  },
  businessContentSkeleton: {
    flex: 1,
    justifyContent: 'space-between',
  },
  businessNameSkeleton: {
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '80%',
    marginBottom: 8,
  },
  businessDescriptionSkeleton: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
    marginBottom: 8,
  },
  businessMetaSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessRatingSkeleton: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 60,
  },
  businessPriceSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 80,
  },
  itemCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImageSkeleton: {
    width: 60,
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 12,
  },
  itemContentSkeleton: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemNameSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '70%',
    marginBottom: 6,
  },
  itemDescriptionSkeleton: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '50%',
    marginBottom: 8,
  },
  itemFooterSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPriceSkeleton: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 70,
  },
  itemActionsSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 