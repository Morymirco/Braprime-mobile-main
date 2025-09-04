import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BusinessType } from '../lib/services/BusinessTypeService';

interface BusinessTypesGridProps {
  businessTypes: BusinessType[];
  onPress?: (businessType: BusinessType) => void;
  maxItems?: number;
}

export default function BusinessTypesGrid({ 
  businessTypes, 
  onPress, 
  maxItems = 8 
}: BusinessTypesGridProps) {
  // Fonction pour formater le nom du type de commerce
  const formatBusinessTypeName = (name: string) => {
    const nameMap: { [key: string]: string } = {
      'restaurant': 'Restaurants',
      'cafe': 'Cafés',
      'market': 'Marchés',
      'supermarket': 'Supermarchés',
      'pharmacy': 'Pharmacie',
      'electronics': 'Électronique',
      'beauty': 'Beauté',
      'hairdressing': 'Coiffure',
      'hardware': 'Bricolage',
      'bookstore': 'Librairie',
      'document_service': 'Documents'
    };
    return nameMap[name] || (name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Service');
  };

  // Fonction pour obtenir le badge selon le type
  const getBadge = (name: string) => {
    const badgeMap: { [key: string]: string } = {
      'supermarket': '24/7',
      'electronics': 'New',
      'pharmacy': '24/7'
    };
    return badgeMap[name];
  };

  const displayTypes = businessTypes.slice(0, maxItems);

  return (
    <View style={styles.container}>
      {displayTypes.map((businessType) => (
        <TouchableOpacity 
          key={businessType.id} 
          style={styles.item}
          onPress={() => onPress?.(businessType)}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={{ 
                uri: businessType.image_url || 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=200&q=80' 
              }} 
              style={styles.icon} 
              resizeMode="cover"
            />
            {getBadge(businessType.name) && (
              <View style={[
                styles.badge,
                { backgroundColor: getBadge(businessType.name) === 'New' ? '#E31837' : '#00C853' }
              ]}>
                <Text style={styles.badgeText}>{getBadge(businessType.name)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{formatBusinessTypeName(businessType.name)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginVertical: 24,
  },
  item: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 8,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000',
  },
}); 