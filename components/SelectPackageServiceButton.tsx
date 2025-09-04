import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../lib/contexts/AuthContext';
import { useToast } from '../lib/contexts/ToastContext';
import { PackageSelectionModal } from './PackageSelectionModal';

// Fonction utilitaire pour détecter les services de colis
const isPackageService = (itemName: string, categoryName?: string): boolean => {
  const packageKeywords = [
    'colis', 'package', 'livraison', 'courier', 'logistics',
    'kg', 'poids', 'dimensions', 'fragile', 'express'
  ];
  
  const packageCategories = [
    'colis léger', 'colis moyen', 'colis lourd', 'fragile', 'express'
  ];
  
  const itemLower = itemName.toLowerCase();
  const categoryLower = categoryName?.toLowerCase() || '';
  
  return packageKeywords.some(keyword => itemLower.includes(keyword)) ||
         packageCategories.some(cat => categoryLower.includes(cat));
};

export interface SelectPackageServiceButtonProps {
  item: {
    id: number;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  categoryName?: string;
  businessId: number;
  businessName: string;
  variant?: 'default' | 'compact' | 'icon';
  style?: any;
}

export const SelectPackageServiceButton: React.FC<SelectPackageServiceButtonProps> = ({
  item,
  categoryName,
  businessId,
  businessName,
  variant = 'default',
  style
}) => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Détecter si c'est un service de colis
  const isPackageServiceType = isPackageService(item.name, categoryName);
  
  // Si ce n'est pas un service de colis, ne pas afficher le bouton
  // (Cette logique est maintenant gérée dans MenuItemDetail)
  if (!isPackageServiceType) {
    return null;
  }
  
  const handleSelectService = () => {
    if (!user) {
      showToast('error', 'Veuillez vous connecter pour sélectionner ce service.');
      return;
    }
    setShowModal(true);
  };
  
  // Variant icon (juste l'icône)
  if (variant === 'icon') {
    return (
      <>
        <TouchableOpacity
          onPress={handleSelectService}
          style={[styles.iconButton, style]}
        >
          <MaterialIcons name="inventory" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        
        <PackageSelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          service={item}
          businessId={businessId}
          businessName={businessName}
          categoryName={categoryName || ''}
        />
      </>
    );
  }

  // Variant compact (petit bouton)
  if (variant === 'compact') {
    return (
      <>
        <TouchableOpacity
          onPress={handleSelectService}
          style={[styles.compactButton, style]}
        >
          <MaterialIcons name="inventory" size={12} color="#FFFFFF" />
          <Text style={styles.compactButtonText}>Sélectionner</Text>
        </TouchableOpacity>
        
        <PackageSelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          service={item}
          businessId={businessId}
          businessName={businessName}
          categoryName={categoryName || ''}
        />
      </>
    );
  }

  // Variant default
  return (
    <>
      <TouchableOpacity
        onPress={handleSelectService}
        style={[styles.defaultButton, style]}
      >
        <MaterialIcons name="inventory" size={16} color="#FFFFFF" />
        <Text style={styles.defaultButtonText}>Sélectionner ce service</Text>
      </TouchableOpacity>
      
      <PackageSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        service={item}
        businessId={businessId}
        businessName={businessName}
        categoryName={categoryName || ''}
      />
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  defaultButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
