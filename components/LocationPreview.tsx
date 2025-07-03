import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { type Location } from '../lib/services/LocationService';

interface LocationPreviewProps {
  location: Location | null;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export default function LocationPreview({ 
  location, 
  onEdit, 
  showEditButton = true 
}: LocationPreviewProps) {
  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.noLocationContainer}>
          <MaterialIcons name="location-off" size={24} color="#999" />
          <Text style={styles.noLocationText}>Aucune adresse sélectionnée</Text>
          {showEditButton && onEdit && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <MaterialIcons name="edit" size={16} color="#E31837" />
              <Text style={styles.editButtonText}>Sélectionner</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.locationContainer}>
        <View style={styles.locationHeader}>
          <MaterialIcons name="location-on" size={20} color="#E31837" />
          <Text style={styles.locationTitle}>Adresse de livraison</Text>
          {showEditButton && onEdit && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <MaterialIcons name="edit" size={16} color="#E31837" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.addressInfo}>
          <Text style={styles.addressText}>{location.address}</Text>
          
          <View style={styles.addressDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="home" size={16} color="#666" />
              <Text style={styles.detailText}>Quartier: {location.neighborhood}</Text>
            </View>
            
            {location.landmark && (
              <View style={styles.detailRow}>
                <MaterialIcons name="place" size={16} color="#666" />
                <Text style={styles.detailText}>Repère: {location.landmark}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <MaterialIcons name="gps-fixed" size={16} color="#666" />
              <Text style={styles.detailText}>
                Coordonnées: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  noLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  noLocationText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  locationContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E31837',
  },
  editButtonText: {
    fontSize: 14,
    color: '#E31837',
    marginLeft: 4,
    fontWeight: '500',
  },
  addressInfo: {
    marginLeft: 28,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  addressDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
}); 