import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const handleLanguageSelect = (language: string) => {
    // TODO: Set language in storage
    router.replace('/select-location');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>BraPrime</Text>
      </View>

      {/* Language Selection */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Select Your Language</Text>
        
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => handleLanguageSelect('en')}
        >
          <Text style={styles.languageText}>English</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.languageButton, styles.lastLanguageButton]}
          onPress={() => handleLanguageSelect('fr')}
        >
          <Text style={styles.languageText}>Français</Text>
        </TouchableOpacity>
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
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 32,
    width: width,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
    fontFamily: 'System',
  },
  languageButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  lastLanguageButton: {
    borderBottomWidth: 0,
  },
  languageText: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'System',
  },
}); 