import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { API_BASE_URL } from '@env';

export default function CustomDrawerContent(props) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
 


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        if (!uid) return;
  
        const res = await axios.get(`${API_BASE_URL}/leaderboard?userId=${uid}`);
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
  }, []);

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
});
