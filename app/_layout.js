import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// 🧠 Komponent wewnętrzny: reaguje na usera i przekierowuje
function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // czekamy na sprawdzenie usera

    const isInAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'welcome';

    // if (!user && !isInAuthGroup) {
    //   // 🔐 niezalogowany → przekieruj do /welcome
    //   router.replace('/index');
     if (user && isInAuthGroup) {
      // 🔓 zalogowany, a jest na login/welcome → idź do home
      router.replace('/home');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}

// 📦 Cała aplikacja: auth + routing
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <Stack />
      </AuthGate>
    </AuthProvider>
  );
}
