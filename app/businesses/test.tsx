import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BusinessTestScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  console.log('🔍 Test Screen - All params:', params);
  console.log('🔍 Test Screen - ID param:', params.id, 'Type:', typeof params.id);

  const handleBackPress = () => {
    router.back();
  };

  const handleTestNavigation = () => {
    router.push('/businesses/1');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Navigation</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Page de test</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Paramètres reçus :</Text>
          <Text style={styles.infoText}>ID: {params.id || 'Aucun ID'}</Text>
          <Text style={styles.infoText}>Type: {typeof params.id}</Text>
          <Text style={styles.infoText}>Tous les params: {JSON.stringify(params)}</Text>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={handleTestNavigation}>
          <Text style={styles.testButtonText}>Tester navigation vers business ID 1</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#E31837',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 