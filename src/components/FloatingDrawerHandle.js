// src/components/FloatingDrawerHandle.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export default function FloatingDrawerHandle() {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <TouchableOpacity style={styles.handle} onPress={openDrawer}>
      <Ionicons name="menu-outline" size={22} color="#333" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    top: 24,
    left: -20, // 👈 ujemna wartość — wystaje poza ekran
    width: 44,
    height: 44,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
});
