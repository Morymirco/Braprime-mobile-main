import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/contexts/AuthContext';
import { SessionService } from '../lib/services/SessionService';

interface SessionStats {
  isAuthenticated: boolean;
  sessionAge: number | null;
  lastActivity: number | null;
  expiresIn: number | null;
}

export default function SessionInfo() {
  const { user, isAuthenticated, sessionValid, refreshSession } = useAuth();
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSessionStats();
      const interval = setInterval(loadSessionStats, 30000); // Mettre à jour toutes les 30 secondes
      return () => clearInterval(interval);
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
      Alert.alert('Succès', 'Session rafraîchie avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du rafraîchissement de la session');
    }
  };

  const formatDuration = (milliseconds: number | null): string => {
    if (!milliseconds) return 'N/A';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setShowDetails(!showDetails)}
      >
        <View style={styles.statusContainer}>
          <MaterialIcons 
            name={sessionValid ? "check-circle" : "warning"} 
            size={20} 
            color={sessionValid ? "#10b981" : "#f59e0b"} 
          />
          <Text style={styles.statusText}>
            Session {sessionValid ? 'Active' : 'Problème'}
          </Text>
        </View>
        <MaterialIcons 
          name={showDetails ? "expand-less" : "expand-more"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      {showDetails && sessionStats && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Utilisateur:</Text>
            <Text style={styles.detailValue}>{user.name || user.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dernière activité:</Text>
            <Text style={styles.detailValue}>
              {sessionStats.lastActivity ? formatDuration(Date.now() - sessionStats.lastActivity) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expire dans:</Text>
            <Text style={styles.detailValue}>
              {sessionStats.expiresIn ? formatDuration(sessionStats.expiresIn) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Âge de session:</Text>
            <Text style={styles.detailValue}>
              {sessionStats.sessionAge ? formatDuration(sessionStats.sessionAge) : 'N/A'}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefreshSession}
          >
            <MaterialIcons name="refresh" size={16} color="#E31837" />
            <Text style={styles.refreshButtonText}>Rafraîchir la session</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: '#333',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#E31837',
    fontWeight: '500',
    marginLeft: 4,
  },
}); 