import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/contexts/AuthContext';
import NotificationService from '../lib/services/NotificationService';

export default function SendNotificationsTestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('Test de notification');
  const [body, setBody] = useState('Ceci est un message de test');
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestNotification = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour envoyer des notifications.');
      return;
    }

    setLoading(true);
    try {
      const result = await NotificationService.sendTestNotification(
        targetUserId || user.id,
        body
      );

      if (result.success) {
        Alert.alert(
          'Succès', 
          `Notification envoyée !\nEnvoyée à: ${result.sent_count} utilisateur(s)\nErreurs: ${result.error_count || 0}`
        );
      } else {
        Alert.alert('Erreur', `Échec de l'envoi: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la notification.');
    } finally {
      setLoading(false);
    }
  };

  const sendCustomNotification = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour envoyer des notifications.');
      return;
    }

    if (!title.trim() || !body.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le corps de la notification.');
      return;
    }

    setLoading(true);
    try {
      const result = await NotificationService.sendToUsers(
        [targetUserId || user.id],
        {
          title: title.trim(),
          body: body.trim(),
          data: {
            type: 'custom_test',
            timestamp: new Date().toISOString()
          },
          priority: 'high'
        }
      );

      if (result.success) {
        Alert.alert(
          'Succès', 
          `Notification envoyée !\nEnvoyée à: ${result.sent_count} utilisateur(s)\nErreurs: ${result.error_count || 0}`
        );
      } else {
        Alert.alert('Erreur', `Échec de l'envoi: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la notification.');
    } finally {
      setLoading(false);
    }
  };

  const sendToAllCustomers = async () => {
    setLoading(true);
    try {
      const result = await NotificationService.sendToUserTypes(
        ['customer'],
        {
          title: 'Notification pour tous les clients',
          body: 'Ceci est une notification envoyée à tous les clients de BraPrime.',
          data: {
            type: 'broadcast',
            target: 'customers'
          },
          priority: 'normal'
        }
      );

      if (result.success) {
        Alert.alert(
          'Succès', 
          `Notification envoyée à tous les clients !\nEnvoyée à: ${result.sent_count} utilisateur(s)\nErreurs: ${result.error_count || 0}`
        );
      } else {
        Alert.alert('Erreur', `Échec de l'envoi: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la notification.');
    } finally {
      setLoading(false);
    }
  };

  const sendOrderNotification = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour envoyer des notifications.');
      return;
    }

    setLoading(true);
    try {
      const result = await NotificationService.sendOrderNotification(
        targetUserId || user.id,
        'test-order-123',
        'confirmée',
        'Restaurant Test'
      );

      if (result.success) {
        Alert.alert(
          'Succès', 
          `Notification de commande envoyée !\nEnvoyée à: ${result.sent_count} utilisateur(s)`
        );
      } else {
        Alert.alert('Erreur', `Échec de l'envoi: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la notification.');
    } finally {
      setLoading(false);
    }
  };

  const sendPaymentNotification = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour envoyer des notifications.');
      return;
    }

    setLoading(true);
    try {
      const result = await NotificationService.sendPaymentNotification(
        targetUserId || user.id,
        15000,
        'success'
      );

      if (result.success) {
        Alert.alert(
          'Succès', 
          `Notification de paiement envoyée !\nEnvoyée à: ${result.sent_count} utilisateur(s)`
        );
      } else {
        Alert.alert('Erreur', `Échec de l'envoi: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la notification.');
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeNotification = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour envoyer des notifications.');
      return;
    }

    setLoading(true);
    try {
      const result = await NotificationService.sendWelcomeNotification(
        targetUserId || user.id,
        user.name || 'Utilisateur'
      );

      if (result.success) {
        Alert.alert(
          'Succès', 
          `Notification de bienvenue envoyée !\nEnvoyée à: ${result.sent_count} utilisateur(s)`
        );
      } else {
        Alert.alert('Erreur', `Échec de l'envoi: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Envoi Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Informations utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Utilisateur</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Connecté en tant que: {user?.name || 'Non connecté'}</Text>
            <Text style={styles.infoText}>ID: {user?.id || 'N/A'}</Text>
          </View>
        </View>

        {/* Configuration de la notification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration de la Notification</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ID Utilisateur cible (optionnel)</Text>
            <TextInput
              style={styles.textInput}
              value={targetUserId}
              onChangeText={setTargetUserId}
              placeholder="Laisser vide pour vous envoyer"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Titre</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de la notification"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={body}
              onChangeText={setBody}
              placeholder="Corps de la notification"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Tests de notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests de Notifications</Text>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={sendTestNotification}
            disabled={loading}
          >
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Notification de Test Simple</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={sendCustomNotification}
            disabled={loading}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Notification Personnalisée</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
            onPress={sendOrderNotification}
            disabled={loading}
          >
            <Ionicons name="bag-outline" size={20} color="#007AFF" />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Notification de Commande</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
            onPress={sendPaymentNotification}
            disabled={loading}
          >
            <Ionicons name="card-outline" size={20} color="#007AFF" />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Notification de Paiement</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
            onPress={sendWelcomeNotification}
            disabled={loading}
          >
            <Ionicons name="hand-left-outline" size={20} color="#007AFF" />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Notification de Bienvenue</Text>
          </TouchableOpacity>
        </View>

        {/* Tests de diffusion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests de Diffusion</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.warningButton, loading && styles.buttonDisabled]} 
            onPress={sendToAllCustomers}
            disabled={loading}
          >
            <Ionicons name="people-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Envoyer à Tous les Clients</Text>
          </TouchableOpacity>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • Les notifications sont envoyées via l'Edge Function Supabase
            </Text>
            <Text style={styles.infoText}>
              • Laissez l'ID utilisateur vide pour vous envoyer la notification
            </Text>
            <Text style={styles.infoText}>
              • Les notifications de diffusion sont envoyées à tous les utilisateurs du type spécifié
            </Text>
            <Text style={styles.infoText}>
              • Vérifiez que votre token push est enregistré dans la page de test des notifications
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
  scrollView: {
    flex: 1,
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
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00bcd4',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31837',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
});
