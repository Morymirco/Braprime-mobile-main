import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useToast } from '../lib/contexts/ToastContext';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View key={toast.id} style={[styles.toastWrapper, { top: 50 + index * 90 }]}>
          <Toast toast={toast} onHide={hideToast} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
  },
}); 