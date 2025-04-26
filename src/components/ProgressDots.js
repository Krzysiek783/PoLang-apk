import { View, StyleSheet } from 'react-native';

export default function ProgressDots({ total = 7, current = 1 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i < current;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#222', // 🖤 Prawie czarny
    width: 28,
  },
  dotInactive: {
    backgroundColor: '#555', // Szary z kontrastem
    width: 12,
  },
});
