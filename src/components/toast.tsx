import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose }) => {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        onClose();
      }, 3000);
    }
  }, [visible, opacity, onClose]);

  const toastStyles = type === 'success' ? styles.successToast : styles.errorToast;

  return (
    <Animated.View
      style={[styles.toastContainer, toastStyles, { opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  successToast: {
    backgroundColor: '#4caf50',
  },
  errorToast: {
    backgroundColor: '#f44336',
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Toast;
