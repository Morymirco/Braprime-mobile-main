import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  return (
    <View style={styles.container}>
      {toasts.map((toast, index) => (
        <View key={toast.id} style={[styles.toastWrapper, { top: 50 + index * 80 }]}>
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
    zIndex: 1000,
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
}); 