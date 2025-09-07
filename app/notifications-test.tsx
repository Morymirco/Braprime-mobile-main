import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/contexts/AuthContext';
import PushTokenService from '../lib/services/PushTokenService';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationsTestScreen() {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const [tokenRegistered, setTokenRegistered] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Écouter les notifications reçues
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Écouter les interactions avec les notifications
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    setPermissionStatus(finalStatus);
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission refusée', 'Les notifications push ne sont pas autorisées.');
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token:', error);
    }

    return token;
  };

  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test de notification locale 📱",
        body: 'Ceci est une notification de test envoyée localement.',
        data: { test: 'local' },
      },
      trigger: { seconds: 1 },
    });
  };

  const sendScheduledNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Notification programmée ⏰",
        body: 'Cette notification a été programmée pour 5 secondes.',
        data: { test: 'scheduled' },
      },
      trigger: { seconds: 5 },
    });
  };

  const sendRepeatingNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Notification répétitive 🔄",
        body: 'Cette notification se répète toutes les 10 secondes.',
        data: { test: 'repeating' },
      },
      trigger: { seconds: 10, repeats: true },
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert('Succès', 'Toutes les notifications programmées ont été annulées.');
  };

  const getNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    Alert.alert(
      'Statut des permissions',
      `Permission: ${status === 'granted' ? 'Accordée' : status === 'denied' ? 'Refusée' : 'Non demandée'}`
    );
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    
    if (status === 'granted') {
      Alert.alert('Succès', 'Les notifications sont maintenant autorisées !');
    } else {
      Alert.alert('Refusé', 'Les notifications ont été refusées.');
    }
  };

  const registerTokenOnServer = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour enregistrer le token.');
      return;
    }

    if (!expoPushToken) {
      Alert.alert('Erreur', 'Aucun token Expo Push disponible.');
      return;
    }

    try {
      const result = await PushTokenService.registerToken(user.id, 'customer');
      
      if (result.success) {
        setTokenRegistered(true);
        Alert.alert('Succès', 'Token enregistré sur le serveur avec succès !');
      } else {
        Alert.alert('Erreur', `Échec de l'enregistrement: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement du token.');
    }
  };

  const getUserTokens = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté.');
      return;
    }

    try {
      const result = await PushTokenService.getUserTokens(user.id);
      
      if (result.success) {
        const tokenCount = result.tokens?.length || 0;
        Alert.alert('Tokens utilisateur', `Vous avez ${tokenCount} token(s) enregistré(s).`);
      } else {
        Alert.alert('Erreur', `Erreur: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la récupération des tokens.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test des Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statut des permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut des Permissions</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Permission: {permissionStatus === 'granted' ? '✅ Accordée' : 
                          permissionStatus === 'denied' ? '❌ Refusée' : 
                          '⚠️ Non demandée'}
            </Text>
            {expoPushToken && (
              <Text style={styles.tokenText}>
                Token: {expoPushToken.substring(0, 20)}...
              </Text>
            )}
          </View>
        </View>

        {/* Gestion des permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion des Permissions</Text>
          
          <TouchableOpacity style={styles.button} onPress={getNotificationPermissions}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Vérifier les permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={requestNotificationPermissions}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#34C759" />
            <Text style={styles.buttonText}>Demander les permissions</Text>
          </TouchableOpacity>
        </View>

        {/* Tests de notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests de Notifications</Text>
          
          <TouchableOpacity style={styles.button} onPress={sendLocalNotification}>
            <Ionicons name="notifications-outline" size={24} color="#FF9500" />
            <Text style={styles.buttonText}>Notification locale (1s)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={sendScheduledNotification}>
            <Ionicons name="time-outline" size={24} color="#5856D6" />
            <Text style={styles.buttonText}>Notification programmée (5s)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={sendRepeatingNotification}>
            <Ionicons name="refresh-outline" size={24} color="#FF2D92" />
            <Text style={styles.buttonText}>Notification répétitive (10s)</Text>
          </TouchableOpacity>
        </View>

        {/* Gestion des tokens push */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion des Tokens Push</Text>
          
          <TouchableOpacity style={styles.button} onPress={registerTokenOnServer}>
            <Ionicons name="cloud-upload-outline" size={24} color="#34C759" />
            <Text style={styles.buttonText}>
              {tokenRegistered ? 'Token enregistré ✓' : 'Enregistrer le token sur le serveur'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={getUserTokens}>
            <Ionicons name="list-outline" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Voir mes tokens</Text>
          </TouchableOpacity>
        </View>

        {/* Gestion des notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion des Notifications</Text>
          
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={cancelAllNotifications}>
            <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
            <Text style={[styles.buttonText, styles.dangerButtonText]}>Annuler toutes les notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Dernière notification reçue */}
        {notification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dernière Notification Reçue</Text>
            <View style={styles.notificationContainer}>
              <Text style={styles.notificationTitle}>
                {notification.request.content.title}
              </Text>
              <Text style={styles.notificationBody}>
                {notification.request.content.body}
              </Text>
              <Text style={styles.notificationData}>
                Données: {JSON.stringify(notification.request.content.data)}
              </Text>
            </View>
          </View>
        )}

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • Les notifications locales fonctionnent même sans connexion internet
            </Text>
            <Text style={styles.infoText}>
              • Les notifications push nécessitent un token Expo valide
            </Text>
            <Text style={styles.infoText}>
              • Sur Android, un canal de notification est créé automatiquement
            </Text>
            <Text style={styles.infoText}>
              • Les permissions peuvent être modifiées dans les paramètres du système
            </Text>
          </View>
        </View>
      </ScrollView>
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
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  buttonText: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 12,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
  },
  dangerButtonText: {
    color: '#c53030',
  },
  notificationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  notificationData: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
});
