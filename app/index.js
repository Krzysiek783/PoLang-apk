import React, { useEffect } from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '../src/contexts/AuthContext';
import { router } from 'expo-router';

export default function SplashScreen() {
  const { user } = useAuth();

  const logoOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const textOpacity = useSharedValue(0);
  useEffect(() => {
    // Animacje
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });
    textOpacity.value = withTiming(1, { duration: 1000, delay: 500, easing: Easing.out(Easing.ease) });
    textTranslateY.value = withTiming(0, { duration: 1000, delay: 500, easing: Easing.out(Easing.ease) });

    // Wymuszone 3 sekundy splash screenu
    const splashTimeout = setTimeout(() => {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/welcome');
      }
    }, 3000); // minimum czas trwania splash-a

    return () => clearTimeout(splashTimeout);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={['#17D5FF', '#15BEE4', '#0E8099']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      locations={[0.19, 0.38, 1]}
      style={styles.container}
    >
      <Animated.Image
        source={require('../assets/logo/logo.png')}
        style={[styles.logo, animatedLogoStyle]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.text, animatedTextStyle]}>
        Ucz się Angielskiego{'\n'}Na własnych Zasadach
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  text: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
