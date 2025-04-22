// app/home/_layout.js
import { Drawer } from 'expo-router/drawer';

export default function HomeDrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="profile" options={{ title: 'Profil' }} />
      <Drawer.Screen name="password" options={{ title: 'Reset hasła' }} />
      <Drawer.Screen name="logout" options={{ title: 'Wyloguj' }} />
    </Drawer>
  );
}
