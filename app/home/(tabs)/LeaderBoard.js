import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL;
const LIMIT = 20;
const BACKEND_URL = `${BASE_URL}/leaderboard`;

export default function LeaderboardScreen() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // 👈 nowość

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchAvatarUrls = async (users) => {
    const storage = getStorage();
    const withUrls = await Promise.all(users.map(async user => {
      try {
        const url = await getDownloadURL(
          ref(storage, user.avatarPath.trim().replace(/^"+|"+$/g, ""))
        );
        return { ...user, avatarPath: url };
      } catch (err) {
        console.warn('Avatar error:', err);
        return { ...user, avatarPath: null };
      }
    }));
    return withUrls;
  };

  const fetchLeaderboard = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}?limit=${LIMIT}&offset=${offset}&userId=${userId}`);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedUser(item)}>
      <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ width: 30 }}>{item.rank}.</Text>
        {item.avatarPath ? (
          <Image source={{ uri: item.avatarPath }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <View style={{ width: 40, height: 40, backgroundColor: '#ccc', borderRadius: 20 }} />
        )}
        <View style={{ marginLeft: 10 }}>
          <Text>{item.nick}</Text>
          <Text>Poziom: {item.level}</Text>
          <Text>Punkty: {item.points}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <Text style={{ fontSize: 24, textAlign: 'center' }}>🏆 Ranking</Text>

      {currentUser && (
        <View style={{ backgroundColor: '#f0f0f0', padding: 10, margin: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Twoje miejsce: {currentUser.rank}</Text>
          <Text>Punkty: {currentUser.points}</Text>
          <Text>Poziom: {currentUser.level}</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        ListFooterComponent={
          loading ? <ActivityIndicator /> : <Button title="Pokaż więcej" onPress={fetchLeaderboard} />
        }
      />

      {/* 🔍 MODAL ZE SZCZEGÓŁAMI */}
      <Modal
        visible={!!selectedUser}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10,
            alignItems: 'center', width: '80%'
          }}>
            {selectedUser?.avatarPath && (
              <Image
                source={{ uri: selectedUser.avatarPath }}
                style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
              />
            )}
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{selectedUser?.nick}</Text>
            <Text>Poziom: {selectedUser?.level}</Text>
            <Text>Punkty: {selectedUser?.points}</Text>
            <Text>Miejsce: {selectedUser?.rank}</Text>

            <Pressable
              onPress={() => setSelectedUser(null)}
              style={{ marginTop: 20, backgroundColor: '#ddd', padding: 10, borderRadius: 5 }}
            >
              <Text>Zamknij</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}






















































// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, ActivityIndicator, Button, Image } from 'react-native';
// import axios from 'axios';
// import { getAuth } from 'firebase/auth';
// import { getDownloadURL, ref, getStorage } from 'firebase/storage';
// import { API_BASE_URL } from '@env';

// const BASE_URL = API_BASE_URL;


// const LIMIT = 20;
// const BACKEND_URL = `${BASE_URL}/leaderboard`;

// export default function LeaderboardScreen() {
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [offset, setOffset] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const auth = getAuth();
//   const userId = auth.currentUser?.uid;

//   useEffect(() => {
//     fetchLeaderboard();
//   }, []);

//   const fetchAvatarUrls = async (users) => {
//     const storage = getStorage();
//     const withUrls = await Promise.all(users.map(async user => {
      
//       console.log("user.nick:", user.nick);
//       console.log("user.avatar:", user.avatarPath);

//       try {
//         const url = await getDownloadURL(
//           ref(storage, user.avatarPath.trim().replace(/^"+|"+$/g, ""))
//         );
//         return { ...user, avatarPath: url };
        

//       } catch (err) {
//         console.warn('Avatar error:', err);
//         return { ...user, avatarPath: null };
        
//       }
//     }));
//     return withUrls;
//   };

//   const fetchLeaderboard = async () => {
//     if (!userId) return;

//     setLoading(true);
//     try {
//       const res = await axios.get(`${BACKEND_URL}?limit=${LIMIT}&offset=${offset}&userId=${userId}`);
//       const newUsers = await fetchAvatarUrls(res.data.top);

//       setUsers(prev => [...prev, ...newUsers]);

//       if (res.data.currentUser) {
//         const currentWithAvatar = await fetchAvatarUrls([res.data.currentUser]);
//         setCurrentUser(currentWithAvatar[0]);
//       }

//       setOffset(prev => prev + LIMIT);
//     } catch (error) {
//       console.error('Fetch error:', error);
//     }
//     setLoading(false);
//   };

//   const renderItem = ({ item }) => (
//     <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
//       <Text style={{ width: 30 }}>{item.rank}.</Text>
//       {item.avatarPath ? (
//         <Image source={{ uri: item.avatarPath }} style={{ width: 40, height: 40, borderRadius: 20 }} />
//       ) : (
//         <View style={{ width: 40, height: 40, backgroundColor: '#ccc', borderRadius: 20 }} />
//       )}
//       <View style={{ marginLeft: 10 }}>
//         <Text>{item.nick}</Text>
//         <Text>Poziom: {item.level}</Text>
//         <Text>Punkty: {item.points}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={{ flex: 1, paddingTop: 50 }}>
//       <Text style={{ fontSize: 24, textAlign: 'center' }}>🏆 Ranking</Text>

//       {currentUser && (
//         <View style={{ backgroundColor: '#f0f0f0', padding: 10, margin: 10 }}>
//           <Text style={{ fontWeight: 'bold' }}>Twoje miejsce: {currentUser.rank}</Text>
//           <Text>Punkty: {currentUser.points}</Text>
//           <Text>Poziom: {currentUser.level}</Text>
//         </View>
//       )}

//       <FlatList
//         data={users}
//         keyExtractor={item => item.uid}
//         renderItem={renderItem}
//         ListFooterComponent={
//           loading ? <ActivityIndicator /> : <Button title="Pokaż więcej" onPress={fetchLeaderboard} />
//         }
//       />
//     </View>
//   );
// }
