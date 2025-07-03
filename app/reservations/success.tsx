import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ReservationSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const reservationData = {
    business_name: params.business_name as string || 'Restaurant',
    business_image: params.business_image as string,
    date: params.date as string || '',
    time: params.time as string || '',
    guests: params.guests as string || '1',
    reservation_id: params.reservation_id as string || 'N/A'
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const handleViewReservations = () => {
    router.push('/reservations');
  };

  const handleGoHome = () => {
    router.push('/(tabs)');
  };

  const handleNewReservation = () => {
    router.push('/reservations/create');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.successCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="checkmark" size={48} color="#fff" />
            </View>
            <View style={styles.outerRing} />
          </View>
          
          <Text style={styles.successTitle}>Réservation confirmée !</Text>
          <Text style={styles.successSubtitle}>
            Votre table a été réservée avec succès
          </Text>
          
          {/* Success Animation Elements */}
          <View style={styles.animationContainer}>
            <View style={[styles.floatingIcon, styles.floatingIcon1]}>
              <Ionicons name="restaurant" size={16} color="#E31837" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon2]}>
              <Ionicons name="calendar" size={16} color="#E31837" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon3]}>
              <Ionicons name="people" size={16} color="#E31837" />
            </View>
          </View>
        </View>

        {/* Reservation Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="restaurant" size={24} color="#E31837" />
            <Text style={styles.cardTitle}>Détails de votre réservation</Text>
          </View>

          {/* Business Info */}
          <View style={styles.businessSection}>
            <View style={styles.businessInfo}>
              {reservationData.business_image ? (
                <Image
                  source={{ uri: reservationData.business_image }}
                  style={styles.businessImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.businessImage, styles.placeholderImage]}>
                  <MaterialIcons name="restaurant" size={32} color="#999" />
                </View>
              )}
              <View style={styles.businessDetails}>
                <Text style={styles.businessName}>{reservationData.business_name}</Text>
                <Text style={styles.businessType}>Restaurant</Text>
              </View>
            </View>
          </View>

          {/* Reservation Info */}
          <View style={styles.reservationInfo}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={20} color="#E31837" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(reservationData.date)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={20} color="#E31837" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Heure</Text>
                <Text style={styles.infoValue}>{formatTime(reservationData.time)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="people-outline" size={20} color="#E31837" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre de personnes</Text>
                <Text style={styles.infoValue}>
                  {reservationData.guests} {parseInt(reservationData.guests) === 1 ? 'personne' : 'personnes'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="receipt-outline" size={20} color="#E31837" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Numéro de réservation</Text>
                <Text style={styles.infoValue}>{reservationData.reservation_id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusBadge}>
              <Ionicons name="time-outline" size={16} color="#E31837" />
              <Text style={styles.statusText}>En attente de confirmation</Text>
            </View>
          </View>
          <Text style={styles.statusDescription}>
            Le restaurant confirmera votre réservation dans les plus brefs délais. 
            Vous recevrez une notification dès confirmation.
          </Text>
          
          {/* Next Steps */}
          <View style={styles.nextStepsContainer}>
            <Text style={styles.nextStepsTitle}>Prochaines étapes :</Text>
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Ionicons name="notifications-outline" size={16} color="#E31837" />
              </View>
              <Text style={styles.stepText}>Attendre la confirmation du restaurant</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Ionicons name="calendar-outline" size={16} color="#E31837" />
              </View>
              <Text style={styles.stepText}>Arriver 5 minutes avant l'heure réservée</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Ionicons name="card-outline" size={16} color="#E31837" />
              </View>
              <Text style={styles.stepText}>Présenter votre numéro de réservation</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleViewReservations}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Voir mes réservations</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleNewReservation}
          >
            <Ionicons name="restaurant-outline" size={20} color="#E31837" />
            <Text style={styles.secondaryButtonText}>Nouvelle réservation</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tertiaryButton}
            onPress={handleGoHome}
          >
            <Ionicons name="home-outline" size={16} color="#666" />
            <Text style={styles.tertiaryButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E31837',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#E31837',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E31837',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  outerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#E31837',
    borderStyle: 'dashed',
    opacity: 0.3,
    zIndex: 1,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  businessSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    color: '#666',
  },
  reservationInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E31837',
    marginLeft: 6,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  nextStepsContainer: {
    marginTop: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#E31837',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#E31837',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E31837',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#E31837',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tertiaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingIcon1: {
    top: '20%',
    right: '15%',
  },
  floatingIcon2: {
    top: '35%',
    left: '10%',
  },
  floatingIcon3: {
    top: '50%',
    right: '25%',
  },
}); 