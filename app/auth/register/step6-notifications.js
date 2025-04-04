import { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Step6Notifications() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [wantsNotifications, setWantsNotifications] = useState(null); // null / true / false
  const [time, setTime] = useState(new Date(2023, 1, 1, 18, 0)); // domyślna 18:00
  const [showPicker, setShowPicker] = useState(false);

  const handleNext = () => {
    if (wantsNotifications === null) {
      return Alert.alert("Wybierz opcję", "Zdecyduj, czy chcesz powiadomienia.");
    }

    const formattedTime = time.toTimeString().slice(0, 5); // "18:00"

    const notificationData = wantsNotifications
      ? {
          enabled: true,
          hour: formattedTime,
        }
      : {
          enabled: false,
          hour: null, // lub po prostu pomiń to pole, ale null jest OK
        };

    router.push({
      pathname: './step7-avatar',
      params: {
        ...params,
        notifications: JSON.stringify(notificationData),
      },
    });
  };

  const onTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || time;
    setShowPicker(Platform.OS === 'ios');
    setTime(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Chcesz codzienne przypomnienie o nauce?</Text>

      <TouchableOpacity
        style={[styles.option, wantsNotifications === true && styles.selected]}
        onPress={() => setWantsNotifications(true)}
      >
        <Text>✅ Tak, przypominaj mi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, wantsNotifications === false && styles.selected]}
        onPress={() => setWantsNotifications(false)}
      >
        <Text>🚫 Nie chcę przypomnień</Text>
      </TouchableOpacity>

      {wantsNotifications && (
        <>
          <Text style={{ fontSize: 16, marginTop: 10 }}>Wybierz godzinę:</Text>
          <Button title={time.toTimeString().slice(0, 5)} onPress={() => setShowPicker(true)} />
          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </>
      )}

      <Button title="Dalej" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    gap: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  selected: {
    backgroundColor: '#ffe8cc',
    borderColor: '#ffa94d',
  },
});
