import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Platform, View,TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FloatingDrawerHandle from '../../../src/components/FloatingDrawerHandle';

export default function HomeTabsLayout() {
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      router.replace('/home/(tabs)');
      return true; // zapobiega cofnięciu poza aplikację
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
                onPress={() => navigation.getParent()?.openDrawer()}
                activeOpacity={0.7}
              >
              </TouchableOpacity>
        {/* 🔘 Pływający przycisk otwierający Drawer */}
        <FloatingDrawerHandle />

        <Tabs
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#6A5ACD',
            tabBarInactiveTintColor: '#aaa',
            tabBarStyle: {
              backgroundColor: '#fff',
              height: 72,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: -2 },
              elevation: 10,
              position: 'absolute',
              paddingBottom: Platform.OS === 'android' ? 10 : 30,
            },
            tabBarIcon: ({ color, focused }) => {
              let iconName;
              switch (route.name) {
                case 'index':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'lesson':
                  iconName = focused ? 'book' : 'book-outline';
                  break;
                case 'quiz':
                  iconName = focused ? 'rocket' : 'rocket-outline';
                  break;
                case 'LeaderBoard':
                  iconName = focused ? 'trophy' : 'trophy-outline';
                  break;
                default:
                  iconName = 'ellipse-outline';
              }

              return (
                <Animated.View style={{ transform: [{ scale: focused ? 1.2 : 1 }] }}>
                  <Ionicons name={iconName} size={28} color={color} />
                </Animated.View>
              );
            },
          })}
        >
          <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
          <Tabs.Screen name="lesson" options={{ title: 'Lekcje' }} />
          <Tabs.Screen name="quiz" options={{ title: 'Quiz' }} />
          <Tabs.Screen name="LeaderBoard" options={{ title: 'Ranking' }} />
        </Tabs>
      </View>
    </GestureHandlerRootView>
  );
}
