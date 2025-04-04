import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Witaj, {user?.email}!</Text>
      <Text style={styles.subtitle}>To Twój ekran główny</Text>

      <Button title="Wyloguj się" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 30,
  },
});
