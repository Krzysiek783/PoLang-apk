import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';

export default function CustomDrawerContent(props) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, user } = useAuth(); // pobieramy user z kontekstu
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      console.log('🛑 Użytkownik nie jest zalogowany – nie pobieram danych z Firestore.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/leaderboard?userId=${user.uid}`);
        if (res.data.currentUser) {
          setUserData({
            ...res.data.currentUser,
            avatarUri: res.data.currentUser.avatarPath ? res.data.currentUser.avatarPath : null
          });
        }
      } catch (err) {
        console.warn('❌ Drawer - error fetching user from leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.navigate('welcome');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {userData?.avatarUri ? (
              <Image source={{ uri: userData.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
            )}
            <Text style={styles.name}>{userData?.nick || 'Użytkownik'}</Text>
            <Text style={styles.level}>Poziom: {userData?.level || 'A1'}</Text>
          </>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>

      {/* PRZYCISK NA DOLE */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
          <View style={styles.logoutRow}>
            <Ionicons name="exit-outline" size={20} color="#000" />
            <Text style={styles.logoutText}>Wyloguj się</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* MODAL POTWIERDZENIA */}
      <Modal isVisible={showLogoutModal} onBackdropPress={() => setShowLogoutModal(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalIcon}>🚪</Text>
          <Text style={styles.modalTitle}>Wylogować się?</Text>
          <Text style={styles.modalMessage}>Czy na pewno chcesz się wylogować z aplikacji?</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
              <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout}>
              <Text style={styles.confirmText}>Tak, wyloguj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#333',
  },
  level: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFEFE8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    backgroundColor: '#EEE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmBtn: {
    backgroundColor: '#FFAD84',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});
