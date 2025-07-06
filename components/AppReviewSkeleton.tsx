import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AppReviewSkeletonProps {
  count?: number;
}

export default function AppReviewSkeleton({ count = 3 }: AppReviewSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar} />
              <View style={styles.userDetails}>
                <View style={styles.userNameSkeleton} />
                <View style={styles.dateSkeleton} />
              </View>
            </View>
            <View style={styles.ratingSkeleton}>
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <View key={starIndex} style={styles.starSkeleton} />
              ))}
            </View>
          </View>
          <View style={styles.commentSkeleton}>
            <View style={styles.commentLine1} />
            <View style={styles.commentLine2} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userNameSkeleton: {
    width: 120,
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  dateSkeleton: {
    width: 80,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  ratingSkeleton: {
    flexDirection: 'row',
  },
  starSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginLeft: 2,
  },
  commentSkeleton: {
    gap: 8,
  },
  commentLine1: {
    width: '100%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  commentLine2: {
    width: '70%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
}); 