import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import NotificationManager from '../src/components/NotificationManager';


// function AuthGate({ children }) {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const segments = useSegments();

//   useEffect(() => {
//     if (loading || segments.length === 0) return; // ⛔️ NIE działaj, dopóki nie wiemy gdzie jesteśmy

//     const current = segments[0]; // np. 'index', 'welcome', 'home'
//     const isInAuthGroup =
//       current === 'login' || current === 'register' || current === 'welcome';

//     if (!user && !isInAuthGroup && current !== 'index') {
//       console.log('🔁 Redirecting to /welcome');
//       router.replace('/welcome');
//     }

//     if (user && isInAuthGroup && current !== 'index') {
//       console.log('🔁 Redirecting to /home');
//       router.replace('/home');
//     }
//   }, [user, loading, segments]);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return children;
// }



// 📦 Cała aplikacja: auth + routing
export default function RootLayout() {
  return (
    <AuthProvider>
           <NotificationManager />
           
      <Stack
        screenOptions={{ headerShown: false }}
      />
     
    </AuthProvider>
  );
}
