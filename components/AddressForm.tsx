import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { CreateAddressData, UserAddress } from '../lib/services/AddressService';

interface AddressFormProps {
  address?: UserAddress | null;
  onSubmit: (data: Omit<CreateAddressData, 'user_id'>) => Promise<{ success: boolean }>;
  onCancel: () => void;
  loading?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Guinée',
    is_default: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code || '',
        country: address.country,
        is_default: address.is_default,
      });
    }
  }, [address]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Le nom de l\'adresse est requis';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'La rue est requise';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'La région/état est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await onSubmit(formData);
    if (result.success) {
      onCancel(); // Fermer le formulaire après succès
    }
  };

  // Mettre à jour un champ
  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ si elle existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {address ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
          </Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Nom de l'adresse */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nom de l'adresse *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: errors.label ? colors.error : colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.label}
              onChangeText={(value) => updateField('label', value)}
              placeholder="Ex: Domicile, Bureau, Villa..."
              placeholderTextColor={colors.textSecondary}
            />
            {errors.label && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.label}
              </Text>
            )}
          </View>

          {/* Rue */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Rue *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: errors.street ? colors.error : colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.street}
              onChangeText={(value) => updateField('street', value)}
              placeholder="Numéro et nom de la rue"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.street && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.street}
              </Text>
            )}
          </View>

          {/* Ville */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Ville *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: errors.city ? colors.error : colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="Nom de la ville"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.city && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.city}
              </Text>
            )}
          </View>

          {/* Région/État */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Région/État *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: errors.state ? colors.error : colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.state}
              onChangeText={(value) => updateField('state', value)}
              placeholder="Ex: Conakry, Kindia, Kankan..."
              placeholderTextColor={colors.textSecondary}
            />
            {errors.state && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.state}
              </Text>
            )}
          </View>

          {/* Code postal */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Code postal
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.postal_code}
              onChangeText={(value) => updateField('postal_code', value)}
              placeholder="Code postal (optionnel)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          {/* Pays */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Pays
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.country}
              onChangeText={(value) => updateField('country', value)}
              placeholder="Pays"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Adresse par défaut */}
          <View style={styles.checkboxGroup}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateField('is_default', !formData.is_default)}
            >
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: formData.is_default ? colors.primary : 'transparent',
                  borderColor: formData.is_default ? colors.primary : colors.border
                }
              ]}>
                {formData.is_default && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Définir comme adresse par défaut
              </Text>
            </TouchableOpacity>
          </View>

          {/* Boutons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                { 
                  backgroundColor: loading ? colors.textSecondary : colors.primary 
                }
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                {loading ? 'Enregistrement...' : (address ? 'Modifier' : 'Ajouter')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  checkboxGroup: {
    marginBottom: 30,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  submitButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
  },
}); 