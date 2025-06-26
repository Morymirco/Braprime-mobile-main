import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDataSync } from '../hooks/useDataSync';

interface SyncStatusProps {
  showDetails?: boolean;
}

export default function SyncStatus({ showDetails = false }: SyncStatusProps) {
  const { isOnline } = useDataSync();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    // Simuler des mises à jour de statut
    const interval = setInterval(() => {
      const now = new Date();
      setLastSyncTime(now);
      
      // Simuler différents statuts
      const statuses: Array<'idle' | 'syncing' | 'error'> = ['idle', 'syncing', 'error'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setSyncStatus(randomStatus);
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return '#E31837'; // Rouge pour hors ligne
    switch (syncStatus) {
      case 'syncing': return '#FFA500'; // Orange pour synchronisation
      case 'error': return '#E31837'; // Rouge pour erreur
      default: return '#00C853'; // Vert pour OK
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return 'wifi-off';
    switch (syncStatus) {
      case 'syncing': return 'sync';
      case 'error': return 'error';
      default: return 'check-circle';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    switch (syncStatus) {
      case 'syncing': return 'Synchronisation...';
      case 'error': return 'Erreur de sync';
      default: return 'Synchronisé';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  if (!showDetails) {
    return (
      <View style={styles.container}>
        <MaterialIcons 
          name={getStatusIcon() as any} 
          size={16} 
          color={getStatusColor()} 
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.detailedContainer}>
      <View style={styles.statusRow}>
        <MaterialIcons 
          name={getStatusIcon() as any} 
          size={20} 
          color={getStatusColor()} 
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Connectivité:</Text>
        <Text style={[styles.detailValue, { color: isOnline ? '#00C853' : '#E31837' }]}>
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </Text>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Dernière sync:</Text>
        <Text style={styles.detailValue}>{formatLastSync()}</Text>
      </View>
      
      {syncStatus === 'syncing' && (
        <View style={styles.syncingIndicator}>
          <MaterialIcons name="sync" size={16} color="#FFA500" />
          <Text style={styles.syncingText}>Mise à jour en cours...</Text>
        </View>
      )}
      
      {syncStatus === 'error' && (
        <View style={styles.errorIndicator}>
          <MaterialIcons name="error" size={16} color="#E31837" />
          <Text style={styles.errorText}>Erreur de synchronisation</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  detailedContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  syncingText: {
    fontSize: 12,
    color: '#FFA500',
    marginLeft: 4,
  },
  errorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#E31837',
    marginLeft: 4,
  },
}); 