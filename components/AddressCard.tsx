import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { UserAddress } from '../lib/services/AddressService';

interface AddressCardProps {
  address: UserAddress;
  isDefault?: boolean;
  onEdit?: (address: UserAddress) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
  showActions?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isDefault = false,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'adresse',
      'Êtes-vous sûr de vouloir supprimer cette adresse ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onDelete?.(address.id)
        },
      ]
    );
  };

  const formatAddress = () => {
    const parts = [
      address.street,
      address.city,
      address.state,
    ];

    if (address.postal_code) {
      parts.splice(2, 0, address.postal_code);
    }

    return parts.filter(Boolean).join(', ');
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.background,
        borderColor: isDefault ? colors.primary : colors.border 
      }
    ]}>
      {/* En-tête avec label et badge par défaut */}
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Ionicons 
            name="location" 
            size={20} 
            color={isDefault ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.label,
            { color: colors.text }
          ]}>
            {address.label}
          </Text>
        </View>
        
        {isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.defaultText}>Par défaut</Text>
          </View>
        )}
      </View>

      {/* Adresse complète */}
      <View style={styles.addressContainer}>
        <Text style={[
          styles.addressText,
          { color: colors.text }
        ]}>
          {formatAddress()}
        </Text>
        
        {address.country && address.country !== 'Guinée' && (
          <Text style={[
            styles.countryText,
            { color: colors.textSecondary }
          ]}>
            {address.country}
          </Text>
        )}
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          {/* Définir comme par défaut */}
          {!isDefault && onSetDefault && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border }]}
              onPress={() => onSetDefault(address.id)}
            >
              <Ionicons name="star-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Par défaut
              </Text>
            </TouchableOpacity>
          )}

          {/* Modifier */}
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border }]}
              onPress={() => onEdit(address)}
            >
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                Modifier
              </Text>
            </TouchableOpacity>
          )}

          {/* Supprimer */}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  countryText: {
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 