import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InitialSplash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/splash');
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>BraPrime</Text>
      </View>

      {/* Made in Conakry text */}
      <View style={styles.madeInContainer}>
        <View style={styles.madeInWrapper}>
          <Text style={styles.madeInText}>Made in Conakry with ❤️</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E31837', // Red color
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  madeInContainer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  madeInWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  madeInText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'System',
  },
}); 