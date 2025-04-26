import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressDots from '../../../src/components/ProgressDots';
import { useFonts } from 'expo-font';

const predefinedAvatars = [
  "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar1.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar2.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar3.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar4.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar5.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar6.png?alt=media",
];

export default function Step7Avatar() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedUri, setSelectedUri] = useState(null);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      return Alert.alert("Brak dostępu", "Musisz zezwolić na dostęp do zdjęć.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!selectedUri) {
      return Alert.alert("Wybierz avatar", "Musisz wybrać jeden z avatarów lub dodać własny.");
    }

    router.push({
      pathname: './confirm',
      params: {
        ...params,
        avatarUri: selectedUri,
      },
    });
  };

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <ProgressDots current={7} />

          <Text style={styles.title}>🖼️ Wybierz swój avatar</Text>

          <View style={styles.avatarsRow}>
            {predefinedAvatars.map((img, idx) => (
              <TouchableOpacity key={idx} onPress={() => setSelectedUri(img)}>
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.avatar,
                    selectedUri === img && styles.selected,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Text style={styles.galleryText}>📷 Wybierz z galerii</Text>
          </TouchableOpacity>

          {selectedUri && (
            <Image source={{ uri: selectedUri }} style={styles.preview} />
          )}

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Zakończ rejestrację</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    paddingTop: 50,
    paddingBottom: 80,
    paddingHorizontal: 30,
    alignItems: 'center',
    gap: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#222',
    textAlign: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#38A169',
    backgroundColor: '#fff',
    elevation: 4,
  },
  galleryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  galleryText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#222',
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#17D5FF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
});
