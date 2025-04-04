import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { AuthProvider } from './src/contexts/AuthContext';

export function App() {
  const ctx = require.context('./app'); // 👈 ładuje cały folder app/
  return (
    <AuthProvider>
      <ExpoRoot context={ctx} />
    </AuthProvider>
  );
}

registerRootComponent(App);
