// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, Alert, Switch, Modal, Pressable
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
dayjs.locale('pl');

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationHour, setNotificationHour] = useState('');
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setSelectedLevel(data.level || '');
        setNotificationsEnabled(data.notifications?.enabled ?? false);
        setNotificationHour(data.notifications?.hour ?? '');
        if (data.notifications?.hour) {
          const [h, m] = data.notifications.hour.split(':');
          const updatedDate = new Date();
          updatedDate.setHours(Number(h));
          updatedDate.setMinutes(Number(m));
          setDate(updatedDate);
        }
      }
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się pobrać danych profilu.');
    }
  };

  const handleLevelChange = async (newLevel) => {
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, { level: newLevel });
      setSelectedLevel(newLevel);
      Alert.alert('Zaktualizowano', `Twój poziom to teraz: ${newLevel}`);
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się zaktualizować poziomu.');
    }
  };

  const handleNotificationToggle = async (value) => {
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(firestore, 'users', uid);
      const update = value
        ? { 'notifications.enabled': true }
        : { 'notifications.enabled': false, 'notifications.hour': null };
      await updateDoc(userRef, update);
      setNotificationsEnabled(value);
      if (value) setShowHourPicker(true);
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się zmienić ustawień powiadomień.');
    }
  };

  const onTimeChange = async (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      const formatted = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
      try {
        const uid = auth.currentUser.uid;
        const userRef = doc(firestore, 'users', uid);
        await updateDoc(userRef, { 'notifications.hour': formatted });
        setNotificationHour(formatted);
        setShowHourPicker(false);
      } catch (e) {
        Alert.alert('Błąd', 'Nie udało się zapisać godziny powiadomień.');
      }
    } else {
      setShowHourPicker(false);
    }
  };

  if (!userData) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>Wczytywanie...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: userData.avatarUri }} style={styles.avatar} />
      <Text style={styles.nick}>{userData.nick}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{userData.email}</Text>

      <Text style={styles.label}>Płeć:</Text>
      <Text style={styles.value}>{userData.gender}</Text>

      <Text style={styles.label}>Wiek:</Text>
      <Text style={styles.value}>{userData.age}</Text>

      <Text style={styles.label}>Poziom nauczania:</Text>
      <Picker
        selectedValue={selectedLevel}
        style={styles.picker}
        onValueChange={handleLevelChange}
      >
        <Picker.Item label="A1" value="A1" />
        <Picker.Item label="A2" value="A2" />
        <Picker.Item label="B1" value="B1" />
        <Picker.Item label="B2" value="B2" />
        <Picker.Item label="C1" value="C1" />
        <Picker.Item label="C2" value="C2" />
      </Picker>

      <Text style={styles.label}>Motywacja:</Text>
      {(userData.motivations || []).map((motivation, index) => (
        <Text key={index} style={styles.value}>• {motivation}</Text>
      ))}

      <Text style={styles.label}>Zweryfikowany:</Text>
      <Text style={styles.value}>{userData.verified ? 'Tak' : 'Nie'}</Text>

      {userData.verifiedAt && (
        <>
          <Text style={styles.label}>Data weryfikacji:</Text>
          <Text style={styles.value}>{dayjs(userData.verifiedAt.toDate()).format('DD MMMM YYYY, HH:mm')}</Text>
        </>
      )}

      <Text style={styles.label}>Powiadomienia:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleNotificationToggle}
        />
        <Text style={[styles.value, { marginLeft: 10 }]}>{notificationsEnabled ? 'Włączone' : 'Wyłączone'}</Text>
      </View>

      {notificationHour !== '' && notificationsEnabled && (
        <Text style={styles.value}>Godzina powiadomień: {notificationHour}</Text>
      )}

      {showHourPicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="spinner"
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FFF9F5'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  nick: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333'
  },
  value: {
    fontSize: 14,
    color: '#555'
  },
  picker: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#fff0e6',
  }
});
