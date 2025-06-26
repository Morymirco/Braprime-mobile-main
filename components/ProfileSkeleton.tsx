import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const ProfileSkeleton: React.FC = () => {
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
      {/* Title */}
      <Animated.View style={[styles.title, { opacity }]} />

      {/* Session Info Skeleton */}
      <View style={styles.sessionSection}>
        <Animated.View style={[styles.sessionCard, { opacity }]}>
          <View style={styles.sessionHeader}>
            <Animated.View style={[styles.sessionIcon, { opacity }]} />
            <Animated.View style={[styles.sessionTitle, { opacity }]} />
          </View>
          <Animated.View style={[styles.sessionInfo, { opacity }]} />
          <Animated.View style={[styles.sessionInfo, { opacity }]} />
        </Animated.View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Animated.View style={[styles.profileAvatar, { opacity }]} />
          <View style={styles.profileInfo}>
            <Animated.View style={[styles.profileName, { opacity }]} />
            <Animated.View style={[styles.profileEmail, { opacity }]} />
            <Animated.View style={[styles.profilePhone, { opacity }]} />
            <Animated.View style={[styles.profileRole, { opacity }]} />
          </View>
        </View>
        <Animated.View style={[styles.editProfileButton, { opacity }]} />
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={index} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Animated.View style={[styles.settingIcon, { opacity }]} />
              <Animated.View style={[styles.settingText, { opacity }]} />
            </View>
            <Animated.View style={[styles.settingChevron, { opacity }]} />
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
    padding: 16,
  },
  title: {
    height: 28,
    width: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 20,
  },
  sessionSection: {
    marginBottom: 20,
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginRight: 8,
  },
  sessionTitle: {
    height: 18,
    width: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  sessionInfo: {
    height: 14,
    width: '80%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    height: 20,
    width: '70%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
  },
  profileEmail: {
    height: 16,
    width: '60%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  profilePhone: {
    height: 16,
    width: '50%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  profileRole: {
    height: 16,
    width: '40%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  editProfileButton: {
    height: 40,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  settingsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginRight: 12,
  },
  settingText: {
    height: 16,
    width: '60%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  settingChevron: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
});

export default ProfileSkeleton; 