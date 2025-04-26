import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import ProgressDots from '../../../src/components/ProgressDots';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function Step6Notifications() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [wantsNotifications, setWantsNotifications] = useState(null);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState('hour');

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleNext = () => {
    if (wantsNotifications === null) {
      return Alert.alert('Wybierz opcję', 'Zdecyduj, czy chcesz powiadomienia.');
    }

    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const notificationData = wantsNotifications
      ? { enabled: true, hour: formattedTime }
      : { enabled: false, hour: null };

    router.push({
      pathname: './step7-avatar',
      params: {
        ...params,
        notifications: JSON.stringify(notificationData),
      },
    });
  };

  const openPicker = (type) => {
    setMode(type);
    setModalVisible(true);
  };

  const renderPickerItem = ({ item }) => {
    const isActive = (mode === 'hour' && item === hour) || (mode === 'minute' && item === minute);
    return (
      <TouchableOpacity
        style={[styles.pickerItem, isActive && styles.pickerItemActive]}
        onPress={() => {
          if (mode === 'hour') setHour(item);
          else setMinute(item);
          setModalVisible(false);
        }}
      >
        <Text style={[styles.pickerItemText, isActive && styles.pickerItemTextActive]}>
          {String(item).padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
        style={styles.container}
      >
        <ProgressDots current={6} />

        <Text style={styles.title}>🔔 Chcesz codzienne przypomnienie o nauce?</Text>

        <TouchableOpacity
          style={[styles.option, wantsNotifications === true && styles.selected]}
          onPress={() => setWantsNotifications(true)}
        >
          <Text style={styles.optionText}>✅ Tak, przypominaj mi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, wantsNotifications === false && styles.selected]}
          onPress={() => setWantsNotifications(false)}
        >
          <Text style={styles.optionText}>🚫 Nie chcę przypomnień</Text>
        </TouchableOpacity>

        {wantsNotifications && (
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>Wybierz godzinę:</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openPicker('hour')}
              >
                <Text style={styles.timeButtonText}>⏰ {String(hour).padStart(2, '0')}</Text>
              </TouchableOpacity>
              <Text style={styles.timeColon}>:</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openPicker('minute')}
              >
                <Text style={styles.timeButtonText}>{String(minute).padStart(2, '0')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Dalej</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={mode === 'hour' ? [...Array(24).keys()] : [...Array(60).keys()]}
                keyExtractor={(item) => item.toString()}
                renderItem={renderPickerItem}
              />
            </View>
          </View>
        </Modal>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#222',
    textAlign: 'center',
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  selected: {
    borderColor: '#ffa94d',
    borderWidth: 2,
    backgroundColor: '#ffe8cc',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#222',
  },
  timeSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  timeLabel: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#222',
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  timeButtonText: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#222',
  },
  timeColon: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#222',
  },
  button: {
    backgroundColor: '#17D5FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  modalContent: {
    backgroundColor: '#fcd5ce', // 🌸 pastelowy, nie biały
    borderRadius: 16,
    maxHeight: '60%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pickerItemActive: {
    backgroundColor: '#F8B195',
    borderColor: '#fff',
    borderWidth: 2,
  },
  pickerItemText: {
    fontSize: 20,
    fontFamily: 'Poppins',
    color: '#222',
  },
  pickerItemTextActive: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
