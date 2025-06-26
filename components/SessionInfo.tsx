import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../lib/contexts/AuthContext';
import { SessionService } from '../lib/services/SessionService';

interface SessionInfoProps {
  showDetails?: boolean;
  onRefresh?: () => void;
}

export default function SessionInfo({ showDetails = false, onRefresh }: SessionInfoProps) {
  const { user, isAuthenticated, sessionValid, refreshSession } = useAuth();
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSessionStats();
    }
  }, [isAuthenticated]);

  const loadSessionStats = async () => {
    try {
      const stats = await SessionService.getSessionStats();
      setSessionStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des stats de session:', error);
    }
  };

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      await loadSessionStats();
      onRefresh?.();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rafraîchir la session');
    }
  };

  const formatDuration = (milliseconds: number | null): string => {
    if (!milliseconds) return 'N/A';
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatTime = (timestamp: number | null): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <MaterialIcons name="person-off" size={20} color="#E31837" />
          <Text style={styles.statusText}>Non connecté</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <MaterialIcons 
            name={sessionValid ? "check-circle" : "warning"} 
            size={20} 
            color={sessionValid ? "#00C853" : "#FF9800"} 
          />
          <Text style={[styles.statusText, { color: sessionValid ? "#00C853" : "#FF9800" }]}>
            {sessionValid ? 'Session valide' : 'Session à rafraîchir'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshSession}>
          <MaterialIcons name="refresh" size={16} color="#E31837" />
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>
            {user.role === 'customer' ? 'Client' : 'Partenaire'}
          </Text>
        </View>
      )}

      {showDetails && sessionStats && (
        <View style={styles.detailsContainer}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.detailsButtonText}>Détails de session</Text>
            <MaterialIcons name="info" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal avec détails complets */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Informations de session</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {sessionStats && (
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Statut:</Text>
                  <Text style={[styles.statValue, { color: sessionStats.isAuthenticated ? "#00C853" : "#E31837" }]}>
                    {sessionStats.isAuthenticated ? 'Connecté' : 'Déconnecté'}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Âge de session:</Text>
                  <Text style={styles.statValue}>
                    {formatDuration(sessionStats.sessionAge)}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Dernière activité:</Text>
                  <Text style={styles.statValue}>
                    {formatTime(sessionStats.lastActivity)}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Expire dans:</Text>
                  <Text style={[styles.statValue, { color: sessionStats.expiresIn < 300000 ? "#E31837" : "#666" }]}>
                    {formatDuration(sessionStats.expiresIn)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleRefreshSession}
              >
                <MaterialIcons name="refresh" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Rafraîchir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 4,
  },
  userInfo: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E31837',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 