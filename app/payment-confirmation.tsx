import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../lib/contexts/ToastContext';
import { PaymentService } from '../lib/services/PaymentService';

export default function PaymentConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { pay_id, order_id, status } = params;

  useEffect(() => {
    if (order_id) {
      checkPaymentStatus();
      
      // Animation de pulsation pour le statut "pending"
      if (paymentStatus?.status?.toLowerCase() === 'pending') {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();
        
        return () => pulseAnimation.stop();
      }
      
      // Vérifier périodiquement le statut si c'est encore "pending"
      const interval = setInterval(async () => {
        try {
          console.log('🔄 Vérification périodique du statut...');
          const response = await PaymentService.checkPaymentStatus({
            order_id: order_id as string,
          });
          
          if (response.success && response.data) {
            const payments = (response.data as any)?.payments || [];
            const latestPayment = payments.length > 0 ? payments[0] : null;
            
            console.log('🔄 Statut actuel:', latestPayment?.status);
            
            if (latestPayment) {
              // Toujours mettre à jour le statut local
              setPaymentStatus(latestPayment);
              
              if (latestPayment.status !== 'pending') {
                // Le statut a changé, arrêter la vérification périodique
                console.log('✅ Statut changé, arrêt de la vérification périodique');
                clearInterval(interval);
                
                if (latestPayment.status === 'success' || latestPayment.status === 'completed') {
                  showToast('success', 'Paiement effectué avec succès !');
                } else if (latestPayment.status === 'failed' || latestPayment.status === 'error') {
                  showToast('error', 'Le paiement a échoué');
                } else {
                  showToast('info', `Statut du paiement: ${latestPayment.status}`);
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Erreur lors de la vérification périodique:', error);
        }
      }, 3000); // Vérifier toutes les 3 secondes
      
      // Nettoyer l'intervalle après 30 secondes
      setTimeout(() => {
        clearInterval(interval);
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      setError('ID de commande manquant');
      setLoading(false);
    }
  }, [order_id]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 PaymentConfirmation: Vérification du statut du paiement avec order_id:', order_id);

      // Utiliser seulement l'order_id pour vérifier le statut
      const response = await PaymentService.checkPaymentStatus({
        order_id: order_id as string,
      });

      console.log('🔍 PaymentConfirmation: Réponse du statut:', response);

      if (response.success && response.data) {
        // Extraire le statut du premier paiement dans la liste
        const payments = (response.data as any)?.payments || [];
        const latestPayment = payments.length > 0 ? payments[0] : null;
        
        if (latestPayment) {
          console.log('🔍 PaymentConfirmation: Statut trouvé:', latestPayment.status);
          setPaymentStatus(latestPayment);
          
          // Afficher un message selon le statut réel en base de données
          if (latestPayment.status === 'success' || latestPayment.status === 'completed') {
            showToast('success', 'Paiement effectué avec succès !');
          } else if (latestPayment.status === 'failed' || latestPayment.status === 'error') {
            showToast('error', 'Le paiement a échoué');
          } else if (latestPayment.status === 'pending') {
            showToast('info', 'Paiement en cours de traitement...');
          } else {
            showToast('info', `Statut du paiement: ${latestPayment.status}`);
          }
        } else {
          setError('Aucun paiement trouvé pour cette commande');
          showToast('error', 'Aucun paiement trouvé');
        }
      } else {
        setError(response.error || 'Impossible de vérifier le statut du paiement');
        showToast('error', 'Erreur lors de la vérification du paiement');
      }
    } catch (error) {
      console.error('❌ PaymentConfirmation: Erreur lors de la vérification:', error);
      setError('Erreur de connexion');
      showToast('error', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    if (order_id) {
      router.push(`/checkout?retry=true&order_id=${order_id}`);
    } else {
      router.push('/checkout');
    }
  };

  const handleViewOrder = () => {
    if (order_id) {
      router.push(`/orders/${order_id}`);
    } else {
      router.push('/orders');
    }
  };

  const handleGoHome = () => {
    router.push('/(tabs)');
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <MaterialIcons name="check-circle" size={64} color="#4CAF50" />;
      case 'failed':
        return <MaterialIcons name="error" size={64} color="#E31837" />;
      case 'pending':
        return <MaterialIcons name="hourglass-empty" size={64} color="#FF9800" />;
      default:
        return <MaterialIcons name="help" size={64} color="#666" />;
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'Paiement réussi !';
      case 'failed':
        return 'Paiement échoué';
      case 'pending':
        return 'Paiement en cours';
      default:
        return 'Statut inconnu';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'Votre paiement a été effectué avec succès. Votre commande est en cours de préparation.';
      case 'failed':
        return 'Votre paiement n\'a pas pu être traité. Veuillez réessayer ou utiliser une autre méthode de paiement.';
      case 'pending':
        return 'Votre paiement est en cours de traitement. Vous recevrez une confirmation une fois le traitement terminé.';
      default:
        return 'Le statut de votre paiement n\'est pas encore déterminé.';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Vérification du paiement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ToastContainer />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#E31837" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={checkPaymentStatus}>
              <MaterialIcons name="refresh" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Réessayer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
              <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ToastContainer />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Confirmation de paiement</Text>
        </View>

        {/* Statut du paiement */}
        <View style={styles.statusContainer}>
          {paymentStatus?.status?.toLowerCase() === 'pending' ? (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              {getStatusIcon(paymentStatus?.status)}
            </Animated.View>
          ) : (
            getStatusIcon(paymentStatus?.status)
          )}
          <Text style={styles.statusTitle}>
            {getStatusTitle(paymentStatus?.status)}
          </Text>
          <Text style={styles.statusMessage}>
            {getStatusMessage(paymentStatus?.status)}
          </Text>
          
          {/* Badge de statut */}
          <View style={[
            styles.statusBadge,
            paymentStatus?.status?.toLowerCase() === 'success' && styles.statusBadgeSuccess,
            paymentStatus?.status?.toLowerCase() === 'failed' && styles.statusBadgeFailed,
            paymentStatus?.status?.toLowerCase() === 'pending' && styles.statusBadgePending,
          ]}>
            <Text style={styles.statusBadgeText}>
              {PaymentService.getStatusLabel(paymentStatus?.status)}
            </Text>
          </View>
        </View>

        {/* Indicateur de progression */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Étapes du paiement</Text>
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, styles.progressStepCompleted]}>
              <View style={styles.progressStepIcon}>
                <MaterialIcons name="payment" size={20} color="#FFF" />
              </View>
              <Text style={styles.progressStepText}>Paiement initié</Text>
            </View>
            
            <View style={[styles.progressLine, 
              paymentStatus?.status?.toLowerCase() !== 'pending' && styles.progressLineCompleted
            ]} />
            
            <View style={[styles.progressStep, 
              paymentStatus?.status?.toLowerCase() !== 'pending' && styles.progressStepCompleted
            ]}>
              <View style={[styles.progressStepIcon,
                paymentStatus?.status?.toLowerCase() !== 'pending' && styles.progressStepIconCompleted
              ]}>
                <MaterialIcons 
                  name={paymentStatus?.status?.toLowerCase() === 'success' ? "check" : 
                        paymentStatus?.status?.toLowerCase() === 'failed' ? "close" : "hourglass-empty"} 
                  size={20} 
                  color={paymentStatus?.status?.toLowerCase() !== 'pending' ? "#FFF" : "#666"} 
                />
              </View>
              <Text style={[styles.progressStepText,
                paymentStatus?.status?.toLowerCase() !== 'pending' && styles.progressStepTextCompleted
              ]}>
                {paymentStatus?.status?.toLowerCase() === 'success' ? 'Paiement réussi' :
                 paymentStatus?.status?.toLowerCase() === 'failed' ? 'Paiement échoué' : 'En cours de traitement'}
              </Text>
            </View>
          </View>
        </View>

        {/* Détails du paiement */}
        {paymentStatus && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Détails du paiement</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID de transaction</Text>
              <Text style={styles.detailValue}>{paymentStatus.pay_id}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Montant</Text>
              <Text style={styles.detailValue}>
                {PaymentService.formatAmount(paymentStatus.amount, 'GNF')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Méthode de paiement</Text>
              <Text style={styles.detailValue}>{paymentStatus.method}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Statut</Text>
              <Text style={[
                styles.detailValue, 
                styles.statusValue,
                paymentStatus.status?.toLowerCase() === 'success' && styles.statusSuccess,
                paymentStatus.status?.toLowerCase() === 'failed' && styles.statusFailed,
                paymentStatus.status?.toLowerCase() === 'pending' && styles.statusPending,
              ]}>
                {PaymentService.getStatusLabel(paymentStatus.status)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {new Date(paymentStatus.created_at).toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {paymentStatus?.status?.toLowerCase() === 'success' ? (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrder}>
                <MaterialIcons name="receipt" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Voir ma commande</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
                <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
              </TouchableOpacity>
            </>
          ) : paymentStatus?.status?.toLowerCase() === 'failed' ? (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={handleRetryPayment}>
                <MaterialIcons name="payment" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Réessayer le paiement</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
                <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={checkPaymentStatus}>
                <MaterialIcons name="refresh" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Actualiser le statut</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
                <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
              </TouchableOpacity>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  statusValue: {
    fontWeight: 'bold',
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  statusFailed: {
    color: '#E31837',
  },
  statusPending: {
    color: '#FF9800',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  statusBadgeSuccess: {
    backgroundColor: '#E8F5E8',
  },
  statusBadgeFailed: {
    backgroundColor: '#FFEBEE',
  },
  statusBadgePending: {
    backgroundColor: '#FFF3E0',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressStepCompleted: {
    opacity: 1,
  },
  progressStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E31837',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStepIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressStepText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressStepTextCompleted: {
    color: '#000',
    fontWeight: '600',
  },
  progressLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 10,
    marginTop: -20,
  },
  progressLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  actionsContainer: {
    padding: 24,
    gap: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#E31837',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#E31837',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E31837',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#E31837',
    fontSize: 16,
    fontWeight: '600',
  },
});
