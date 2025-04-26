import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomDrawerContent from '../../src/components/CustomDrawerContent'; // ✅

export default function HomeDrawerLayout() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
     
      

      {/* DRAWER */}
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          drawerActiveTintColor: '#6A5ACD',
          drawerInactiveTintColor: '#555',
          drawerStyle: {
            backgroundColor: '#FFEFE8',
            paddingTop: 20,
          },
          drawerLabelStyle: {
            fontFamily: 'Poppins',
            fontSize: 16,
          },
          drawerIcon: ({ focused, color }) => {
            let iconName;

            switch (route.name) {
              case 'profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              case 'password':
                iconName = focused ? 'key' : 'key-outline';
                break;
              case 'logout':
                iconName = focused ? 'exit' : 'exit-outline';
                break;
              default:
                iconName = 'menu';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Drawer.Screen name="profile" options={{ title: 'Profil' }} />
        <Drawer.Screen name="password" options={{ title: 'Reset hasła' }} />
        <Drawer.Screen name="logout" options={{ title: 'Wyloguj' }} />
      </Drawer>
    </View>
  );
}

const styles = StyleSheet.create({
  
});
