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
import { useReservations } from '../../hooks/useReservations';

export default function CreateReservationScreen() {
  const router = useRouter();
  const { createReservation } = useReservations();

  const [businessName, setBusinessName] = useState('');
  const [businessId, setBusinessId] = useState<number>(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom du restaurant');
      return;
    }

    if (!date.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une date');
      return;
    }

    if (!time.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une heure');
      return;
    }

    if (parseInt(partySize) < 1) {
      Alert.alert('Erreur', 'Le nombre de personnes doit être au moins 1');
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationData = {
        business_id: businessId || 1, // Valeur par défaut si pas d'ID
        business_name: businessName.trim(),
        business_image: '', // Sera rempli par le service si nécessaire
        date: date, // Format YYYY-MM-DD
        time: time, // Format HH:MM
        party_size: parseInt(partySize),
        special_requests: specialRequests.trim() || undefined
      };

      const result = await createReservation(reservationData);

      if (result.success) {
        Alert.alert(
          'Succès',
          'Votre réservation a été créée avec succès',
          [
            {
              text: 'OK',
              onPress: () => router.push('/reservations')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la création de la réservation');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la création de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle Réservation</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom du restaurant"
            value={businessName}
            onChangeText={setBusinessName}
            autoCapitalize="words"
          />
        </View>

        {/* Date and Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Heure (HH:MM)"
            value={time}
            onChangeText={setTime}
            keyboardType="numeric"
          />
        </View>

        {/* Party Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nombre de personnes</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de personnes"
            value={partySize}
            onChangeText={setPartySize}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demandes spéciales (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Table près de la fenêtre, allergie aux fruits de mer..."
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Création en cours...' : 'Créer la réservation'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#E31837',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 