import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PushNotificationBannerProps {
  onPress?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  hideDelay?: number;
}

export default function PushNotificationBanner({
  onPress,
  onDismiss,
  autoHide = true,
  hideDelay = 5000,
}: PushNotificationBannerProps) {
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Écouter les notifications reçues
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      showBanner();
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  const showBanner = () => {
    setVisible(true);
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide si activé
    if (autoHide) {
      setTimeout(() => {
        hideBanner();
      }, hideDelay);
    }
  };

  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setNotification(null);
      onDismiss?.();
    });
  };

  const handlePress = () => {
    onPress?.(notification);
    hideBanner();
  };

  if (!visible || !notification) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity style={styles.banner} onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#007AFF" />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.request.content.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.request.content.body}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={hideBanner}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
