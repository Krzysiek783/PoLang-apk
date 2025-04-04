import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Ekrany drawer
import Profile from './profile';
import Settings from './settings';
import Reset from './reset';

// Tab Navigator
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Lekcje"
        component={() => <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>📘 Lekcje</Text>}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={() => <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>💬 Chat</Text>}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Statystyki"
        component={() => <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>📊 Statystyki</Text>}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Ranking"
        component={() => <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>🏆 Ranking</Text>}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator
const DrawerNav = createDrawerNavigator();

export default function DrawerLayout() {
  return (
    <DrawerNav.Navigator>
      <DrawerNav.Screen name="Aplikacja" component={MainTabs} />
      <DrawerNav.Screen name="👤 Mój profil" component={Profile} />
      <DrawerNav.Screen name="⚙️ Ustawienia" component={Settings} />
      <DrawerNav.Screen name="🧹 Reset postępu" component={Reset} />
    </DrawerNav.Navigator>
  );
}
