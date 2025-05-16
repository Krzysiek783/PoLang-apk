import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Image, Modal, Pressable, TouchableOpacity, StyleSheet, Dimensions
} from 'react-native';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');
const BASE_URL = API_BASE_URL;
const LIMIT = 20;

export default function LeaderboardScreen() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchAvatarUrls = async (users) => {
    const storage = getStorage();
    return await Promise.all(users.map(async user => {
      try {
        const url = await getDownloadURL(ref(storage, user.avatarPath.trim().replace(/^"+|"+$/g, '')));
        return { ...user, avatarPath: url };
      } catch {
        return { ...user, avatarPath: null };
      }
    }));
  };

  const fetchLeaderboard = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/leaderboard?limit=${LIMIT}&offset=${offset}&userId=${userId}`);
      const newUsers = await fetchAvatarUrls(res.data.top);
      setUsers(prev => [...prev, ...newUsers]);
      if (res.data.currentUser) {
        const currentWithAvatar = await fetchAvatarUrls([res.data.currentUser]);
        setCurrentUser(currentWithAvatar[0]);
      }
      setOffset(prev => prev + LIMIT);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const renderItem = ({ item, index }) => {
    const isTopThree = index < 3;
    const isCurrent = currentUser && item.uid === currentUser.uid;

    const backgroundColors = ['#FFE7D6', '#D0F0E0', '#C6E2FF'];
    const rankMedals = ['🥇', '🥈', '🥉'];

    return (
      <TouchableOpacity onPress={() => setSelectedUser(item)} style={[styles.card, {
        backgroundColor: isTopThree ? backgroundColors[index] : '#fff',
        borderColor: isCurrent ? '#17D5FF' : 'transparent',
        borderWidth: isCurrent ? 2 : 0,
        shadowColor: isCurrent ? '#17D5FF' : '#000',
        shadowOpacity: 0.1,
      }]}>
        <Text style={styles.rank}>{isTopThree ? rankMedals[index] : `${item.rank}.`}</Text>
        {item.avatarPath ? (
          <Image source={{ uri: item.avatarPath }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar} />
        )}
        <View>
          <Text style={styles.nick}>{item.nick}</Text>
          <Text style={styles.meta}>📘 {item.level} | 🏆 {item.points} pkt</Text>
          
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundShape} />
      <Text style={styles.title}>🏆 Ranking</Text>

      {currentUser && (
        <View style={styles.currentBox}>
          <Text style={styles.currentTitle}>Twoje miejsce: {currentUser.rank}</Text>
          <Text>🔥 {currentUser.streak} dni • {currentUser.points} pkt • {currentUser.level}</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
        ListFooterComponent={loading ? <ActivityIndicator /> : (
          <Pressable onPress={fetchLeaderboard} style={styles.moreBtn}>
            <Text style={styles.moreText}>Pokaż więcej</Text>
          </Pressable>
        )}
      />

      <Modal visible={!!selectedUser} transparent animationType="slide" onRequestClose={() => setSelectedUser(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser?.avatarPath && (
              <Image source={{ uri: selectedUser.avatarPath }} style={styles.modalAvatar} />
            )}
            <Text style={styles.modalTitle}>{selectedUser?.nick}</Text>
            <Text>Poziom: {selectedUser?.level}</Text>
            <Text>Punkty: {selectedUser?.points}</Text>
            <Text>Miejsce: {selectedUser?.rank}</Text>
            <Pressable onPress={() => setSelectedUser(null)} style={styles.modalClose}>
              <Text>Zamknij</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FFEFE8' },
  backgroundShape: {
    position: 'absolute',
    width,
    height: 300,
    backgroundColor: '#FFD5A5',
    transform: [{ skewY: '-10deg' }],
    borderBottomRightRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 50,
    marginBottom: 10,
    color: '#2E2E2E',
  },
  currentBox: {
    marginHorizontal: 20,
    backgroundColor: '#FFF6F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  currentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    backgroundColor: '#fff',
  },
  rank: { width: 30, fontSize: 18 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  placeholderAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ccc' },
  nick: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12, color: '#444' },
  statuses: { fontSize: 12, color: '#6A5ACD', marginTop: 2 },
  moreBtn: {
    backgroundColor: '#6A5ACD',
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
  },
  moreText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderRadius: 12,
    alignItems: 'center', width: '80%',
  },
  modalAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalClose: {
    marginTop: 20, backgroundColor: '#eee', padding: 10, borderRadius: 5,
  },
});