import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useBusiness } from '../hooks/useBusiness';
import { useBusinessReview } from '../hooks/useBusinessReview';

export default function BusinessReviewScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const businessId = parseInt(params.id || '0');
  
  const { business } = useBusiness(businessId.toString());
  const { userReview, stats, loading, createReview, updateReview, deleteReview } = useBusinessReview(businessId);
  
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [comment, setComment] = useState(userReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note entre 1 et 5 étoiles');
      return;
    }

    setSubmitting(true);
    try {
      let result;
      
      if (userReview) {
        // Mettre à jour l'avis existant
        result = await updateReview(userReview.id, { rating, comment });
      } else {
        // Créer un nouvel avis
        result = await createReview({ rating, comment });
      }

      if (result.success) {
        Alert.alert(
          'Succès',
          userReview ? 'Votre avis a été mis à jour avec succès' : 'Merci pour votre avis !',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de l\'enregistrement de l\'avis');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!userReview) return;

    Alert.alert(
      'Supprimer l\'avis',
      'Êtes-vous sûr de vouloir supprimer votre avis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteReview(userReview.id);
            if (result.success) {
              setRating(0);
              setComment('');
              Alert.alert('Succès', 'Votre avis a été supprimé');
            } else {
              Alert.alert('Erreur', result.error || 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Très mauvais';
      case 2: return 'Mauvais';
      case 3: return 'Moyen';
      case 4: return 'Bon';
      case 5: return 'Excellent';
      default: return 'Sélectionnez une note';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Donner un avis</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Donner un avis</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations du commerce */}
        {business && (
          <View style={styles.businessContainer}>
            <Text style={styles.businessTitle}>Avis pour {business.name}</Text>
            <View style={styles.businessInfo}>
              <Text style={styles.businessType}>{business.business_type?.name}</Text>
              {business.cuisine_type && (
                <Text style={styles.cuisineType}>{business.cuisine_type}</Text>
              )}
            </View>
          </View>
        )}

        {/* Statistiques du commerce */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Avis du commerce</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialIcons
                      key={star}
                      name={stats.averageRating >= star ? "star" : "star-border"}
                      size={16}
                      color={stats.averageRating >= star ? "#f59e0b" : "#d1d5db"}
                    />
                  ))}
                </View>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalReviews}</Text>
                <Text style={styles.statLabel}>Avis total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Formulaire d'avis */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {userReview ? 'Modifier votre avis' : 'Partagez votre expérience'}
          </Text>
          
          {/* Note avec étoiles */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Votre note</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <MaterialIcons
                    name={rating >= star ? "star" : "star-border"}
                    size={32}
                    color={rating >= star ? "#f59e0b" : "#d1d5db"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
          </View>

          {/* Commentaire */}
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Votre commentaire (optionnel)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Partagez votre expérience avec ce commerce..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.submitButton, (rating === 0 || submitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Enregistrement...' : (userReview ? 'Mettre à jour' : 'Envoyer l\'avis')}
              </Text>
            </TouchableOpacity>

            {userReview && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Supprimer mon avis</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Informations supplémentaires */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Pourquoi donner un avis ?</Text>
          <View style={styles.infoItem}>
            <Ionicons name="bulb-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Aidez le commerce à s'améliorer</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Partagez votre expérience avec d'autres clients</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="heart-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Votre feedback aide à maintenir la qualité</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  businessContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  businessInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  businessType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cuisineType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E31837',
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  actionsContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#E31837',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E31837',
  },
  deleteButtonText: {
    color: '#E31837',
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
}); 