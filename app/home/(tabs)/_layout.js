// app/home/(tabs)/_layout.js
import { Tabs } from 'expo-router';

export default function HomeTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="lesson" options={{ title: 'Lekcje' }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz/test' }} />
      <Tabs.Screen name="LeaderBoard" options={{ title: 'Rankinggg' }} />
    </Tabs>
  );
}
