import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface BusinessCardSkeletonProps {
  count?: number;
}

export default function BusinessCardSkeleton({ count = 6 }: BusinessCardSkeletonProps) {
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
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <Animated.View style={[styles.image, { opacity }]} />
          <View style={styles.content}>
            <Animated.View style={[styles.title, { opacity }]} />
            <Animated.View style={[styles.subtitle, { opacity }]} />
            <View style={styles.details}>
              <Animated.View style={[styles.rating, { opacity }]} />
              <Animated.View style={[styles.delivery, { opacity }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 1,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
    width: '80%',
  },
  subtitle: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 60,
  },
  delivery: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 80,
  },
}); 