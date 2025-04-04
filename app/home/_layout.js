import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';


export default function HomeLayout() {
  return (
    
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Lekcje',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statystyki',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
