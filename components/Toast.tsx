import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Toast as ToastType } from '../lib/contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onHide: (id: string) => void;
}

export default function Toast({ toast, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const autoHideTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after duration
    if (toast.duration && toast.duration > 0) {
      autoHideTimeout.current = setTimeout(() => {
        handleHide();
      }, toast.duration);
    }

    return () => {
      if (autoHideTimeout.current) {
        clearTimeout(autoHideTimeout.current);
      }
    };
  }, [toast.duration]);

  const handleHide = () => {
    // Clear auto-hide timeout if it exists
    if (autoHideTimeout.current) {
      clearTimeout(autoHideTimeout.current);
      autoHideTimeout.current = null;
    }

    // Animate out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  };

  const getIconName = () => {
    switch (toast.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: '#10B981', // Vert BraPrime
          borderColor: '#059669',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: '#E31837', // Rouge BraPrime principal
          borderColor: '#C41E3A',
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B', // Orange BraPrime
          borderColor: '#D97706',
          iconColor: '#FFFFFF',
        };
      case 'info':
        return {
          backgroundColor: '#3B82F6', // Bleu BraPrime
          borderColor: '#2563EB',
          iconColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: '#E31837', // Rouge BraPrime par défaut
          borderColor: '#C41E3A',
          iconColor: '#FFFFFF',
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: toastStyle.backgroundColor,
          borderColor: toastStyle.borderColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={getIconName()} size={22} color={toastStyle.iconColor} />
        </View>
        <Text style={[styles.message, { color: toastStyle.iconColor }]}>{toast.message}</Text>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={handleHide}>
        <MaterialIcons name="close" size={18} color={toastStyle.iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12, // Coins plus arrondis pour BraPrime
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1, // Bordure pour plus de définition
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4, // Ombre plus prononcée
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // Élévation plus importante
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fond semi-transparent pour l'icône
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  message: {
    fontSize: 15,
    fontWeight: '600', // Police plus grasse pour BraPrime
    flex: 1,
    lineHeight: 20,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fond semi-transparent pour le bouton
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
}); 