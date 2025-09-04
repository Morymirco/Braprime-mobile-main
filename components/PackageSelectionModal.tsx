import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../lib/contexts/AuthContext';
import { useToast } from '../lib/contexts/ToastContext';
import { MultiPackageInfo, PackageItem, PackageOrderService } from '../lib/services/PackageOrderService';

export interface PackageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: number;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  businessId: number;
  businessName: string;
  categoryName: string;
}

export const PackageSelectionModal: React.FC<PackageSelectionModalProps> = ({
  isOpen,
  onClose,
  service,
  businessId,
  businessName,
  categoryName
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [packageInfo, setPackageInfo] = useState<MultiPackageInfo>({
    pickup_address: '',
    pickup_date: '',
    pickup_time: '',
    drop_date: '',
    drop_time: '',
    packages: [
      {
        id: '1',
        package_type: 'parcel',
        weight: 1,
        dimensions: { length: 20, width: 15, height: 10 },
        delivery_address: '',
        recipient_name: '',
        recipient_phone: '',
        insurance_required: false,
        express_delivery: false,
        signature_required: false
      }
    ],
    estimated_price: service.price,
    delivery_time: '2-3 jours'
  });

  // Calculer le prix estimé en fonction de tous les colis
  const calculateEstimatedPrice = () => {
    return PackageOrderService.calculateEstimatedPrice(service.price, packageInfo.packages);
  };

  // Mettre à jour le prix estimé quand les options changent
  React.useEffect(() => {
    const newPrice = calculateEstimatedPrice();
    setPackageInfo(prev => ({
      ...prev,
      estimated_price: newPrice
    }));
  }, [packageInfo.packages]);

  // Ajouter un nouveau colis
  const addPackage = () => {
    const newPackage: PackageItem = {
      id: Date.now().toString(),
      package_type: 'parcel',
      weight: 1,
      dimensions: { length: 20, width: 15, height: 10 },
      delivery_address: '',
      recipient_name: '',
      recipient_phone: '',
      insurance_required: false,
      express_delivery: false,
      signature_required: false
    };
    
    setPackageInfo(prev => ({
      ...prev,
      packages: [...prev.packages, newPackage]
    }));
  };

  // Supprimer un colis
  const removePackage = (packageId: string) => {
    if (packageInfo.packages.length <= 1) {
      showToast('error', 'Au moins un colis est requis.');
      return;
    }
    
    setPackageInfo(prev => ({
      ...prev,
      packages: prev.packages.filter(pkg => pkg.id !== packageId)
    }));
  };

  // Mettre à jour un colis spécifique
  const updatePackage = (packageId: string, updates: Partial<PackageItem>) => {
    setPackageInfo(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => 
        pkg.id === packageId ? { ...pkg, ...updates } : pkg
      )
    }));
  };

  // Fonction pour pré-remplir avec des données d'exemple
  const handlePreFillForm = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setPackageInfo({
      pickup_address: '123 Rue Alpha, Conakry Centre, Guinée',
      pickup_instructions: 'Appeler au 123 456 789 avant le départ',
      pickup_date: today.toISOString().split('T')[0],
      pickup_time: '09:00',
      drop_date: tomorrow.toISOString().split('T')[0],
      drop_time: '14:00',
      packages: [
        {
          id: '1',
          package_type: 'document',
          weight: 0.5,
          dimensions: { length: 30, width: 20, height: 5 },
          delivery_address: '456 Avenue Beta, Kaloum, Conakry, Guinée',
          delivery_instructions: 'Livrer au bureau de réception',
          recipient_name: 'M. Diallo',
          recipient_phone: '+224 123 456 789',
          recipient_email: 'diallo@example.com',
          insurance_required: true,
          express_delivery: false,
          signature_required: true
        },
        {
          id: '2',
          package_type: 'parcel',
          weight: 2.5,
          dimensions: { length: 40, width: 30, height: 15 },
          delivery_address: '789 Boulevard Gamma, Ratoma, Conakry, Guinée',
          delivery_instructions: 'Livrer à l\'entrée principale',
          recipient_name: 'Mme Camara',
          recipient_phone: '+224 987 654 321',
          recipient_email: 'camara@example.com',
          insurance_required: false,
          express_delivery: true,
          signature_required: false
        }
      ],
      estimated_price: service.price + 15000,
      delivery_time: '1-2 jours'
    });
    
    showToast('success', 'Le formulaire a été pré-rempli avec des données d\'exemple.');
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast('error', 'Vous devez être connecté pour créer une commande.');
      return;
    }

    // Validation
    const validation = PackageOrderService.validatePackageOrder(packageInfo);
    if (!validation.isValid) {
      Alert.alert('Erreur de validation', validation.errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer une commande spéciale pour service de colis multi-destinations
      const orderData = {
        business_id: businessId,
        service_name: service.name,
        service_price: service.price,
        pickup_address: {
          address: packageInfo.pickup_address,
          instructions: packageInfo.pickup_instructions
        },
        delivery_preferences: {
          preferred_time: packageInfo.drop_time,
          pickup_date: packageInfo.pickup_date,
          pickup_time: packageInfo.pickup_time,
          drop_date: packageInfo.drop_date,
          drop_time: packageInfo.drop_time,
          contact_method: 'phone'
        },
        packages: packageInfo.packages.map(pkg => ({
          package_type: pkg.package_type,
          weight: pkg.weight.toString(),
          dimensions: `${pkg.dimensions.length}x${pkg.dimensions.width}x${pkg.dimensions.height}`,
          description: `Type: ${pkg.package_type}, Fragile: ${pkg.insurance_required ? 'Oui' : 'Non'}, Urgent: ${pkg.express_delivery ? 'Oui' : 'Non'}`,
          is_fragile: pkg.insurance_required,
          is_urgent: pkg.express_delivery,
          delivery_address: {
            address: pkg.delivery_address,
            instructions: pkg.delivery_instructions
          },
          customer_info: {
            name: pkg.recipient_name,
            phone: pkg.recipient_phone,
            email: pkg.recipient_email || user?.email || ''
          }
        }))
      };
      
      // Appeler le service de création de commande
      const result = await PackageOrderService.createMultiPackageOrder(orderData);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur inconnue');
      }
      
      showToast('success', `Votre demande de livraison de ${packageInfo.packages.length} colis a été enregistrée avec succès.`);
      onClose();
    } catch (error) {
      console.error('Erreur création commande colis:', error);
      showToast('error', 'Impossible de créer la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const packageTypes = [
    { value: 'document', label: 'Document' },
    { value: 'parcel', label: 'Colis standard' },
    { value: 'fragile', label: 'Fragile' },
    { value: 'heavy', label: 'Lourd' },
    { value: 'express', label: 'Express' }
  ];

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Livraison Multi-Colis</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Service sélectionné */}
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Service sélectionné</Text>
            <View style={styles.serviceInfo}>
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceCategory}>{categoryName}</Text>
                {service.description && (
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                )}
              </View>
              <Text style={styles.servicePrice}>{service.price.toLocaleString()} FG</Text>
            </View>
          </View>

          {/* Bouton de pré-remplissage */}
          <View style={styles.helpCard}>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>💡 Besoin d'aide ?</Text>
              <Text style={styles.helpText}>Pré-remplissez le formulaire avec des données d'exemple</Text>
            </View>
            <TouchableOpacity style={styles.prefillButton} onPress={handlePreFillForm}>
              <Text style={styles.prefillButtonText}>Pré-remplir</Text>
            </TouchableOpacity>
          </View>

          {/* Adresse de départ commune */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={20} color="#E31837" />
              <Text style={styles.sectionTitle}>Adresse de départ (commune)</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse de départ *</Text>
              <TextInput
                style={styles.textInput}
                value={packageInfo.pickup_address}
                onChangeText={(text) => setPackageInfo({...packageInfo, pickup_address: text})}
                placeholder="Adresse de départ pour tous les colis"
                placeholderTextColor="#999"
                multiline
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instructions de départ</Text>
              <TextInput
                style={styles.textInput}
                value={packageInfo.pickup_instructions || ''}
                onChangeText={(text) => setPackageInfo({...packageInfo, pickup_instructions: text})}
                placeholder="Instructions pour le départ"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          </View>

          {/* Horaires de départ et livraison */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="access-time" size={20} color="#E31837" />
              <Text style={styles.sectionTitle}>Horaires de service</Text>
            </View>
            
            <View style={styles.timeGrid}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Date de départ *</Text>
                <TextInput
                  style={styles.textInput}
                  value={packageInfo.pickup_date}
                  onChangeText={(text) => setPackageInfo({...packageInfo, pickup_date: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Heure de départ *</Text>
                <TextInput
                  style={styles.textInput}
                  value={packageInfo.pickup_time}
                  onChangeText={(text) => setPackageInfo({...packageInfo, pickup_time: text})}
                  placeholder="HH:MM"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.timeGrid}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Date de livraison *</Text>
                <TextInput
                  style={styles.textInput}
                  value={packageInfo.drop_date}
                  onChangeText={(text) => setPackageInfo({...packageInfo, drop_date: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Heure de livraison *</Text>
                <TextInput
                  style={styles.textInput}
                  value={packageInfo.drop_time}
                  onChangeText={(text) => setPackageInfo({...packageInfo, drop_time: text})}
                  placeholder="HH:MM"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Liste des colis */}
          <View style={styles.section}>
            <View style={styles.packagesHeader}>
              <Text style={styles.sectionTitle}>Colis à livrer</Text>
              <TouchableOpacity style={styles.addButton} onPress={addPackage}>
                <MaterialIcons name="add" size={20} color="#E31837" />
                <Text style={styles.addButtonText}>Ajouter un colis</Text>
              </TouchableOpacity>
            </View>

            {packageInfo.packages.map((pkg, index) => (
              <View key={pkg.id} style={styles.packageCard}>
                <View style={styles.packageHeader}>
                  <Text style={styles.packageTitle}>Colis {index + 1}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePackage(pkg.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                {/* Type de colis */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Type de colis</Text>
                  <View style={styles.packageTypeGrid}>
                    {packageTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.packageTypeButton,
                          pkg.package_type === type.value && styles.packageTypeButtonSelected
                        ]}
                        onPress={() => updatePackage(pkg.id, { package_type: type.value as any })}
                      >
                        <Text style={[
                          styles.packageTypeText,
                          pkg.package_type === type.value && styles.packageTypeTextSelected
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Poids et dimensions */}
                <View style={styles.dimensionsGrid}>
                  <View style={styles.weightInput}>
                    <Text style={styles.label}>Poids (kg)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={pkg.weight.toString()}
                      onChangeText={(text) => updatePackage(pkg.id, { weight: parseFloat(text) || 0 })}
                      placeholder="1.0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.dimensionsInput}>
                    <Text style={styles.label}>Dimensions (cm)</Text>
                    <View style={styles.dimensionsRow}>
                      <TextInput
                        style={styles.dimensionInput}
                        placeholder="L"
                        value={pkg.dimensions.length.toString()}
                        onChangeText={(text) => updatePackage(pkg.id, {
                          dimensions: {...pkg.dimensions, length: parseFloat(text) || 0}
                        })}
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={styles.dimensionInput}
                        placeholder="l"
                        value={pkg.dimensions.width.toString()}
                        onChangeText={(text) => updatePackage(pkg.id, {
                          dimensions: {...pkg.dimensions, width: parseFloat(text) || 0}
                        })}
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={styles.dimensionInput}
                        placeholder="H"
                        value={pkg.dimensions.height.toString()}
                        onChangeText={(text) => updatePackage(pkg.id, {
                          dimensions: {...pkg.dimensions, height: parseFloat(text) || 0}
                        })}
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* Destination spécifique */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Adresse de livraison *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={pkg.delivery_address}
                    onChangeText={(text) => updatePackage(pkg.id, { delivery_address: text })}
                    placeholder={`Adresse de livraison pour le colis ${index + 1}`}
                    placeholderTextColor="#999"
                    multiline
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Instructions de livraison</Text>
                  <TextInput
                    style={styles.textInput}
                    value={pkg.delivery_instructions || ''}
                    onChangeText={(text) => updatePackage(pkg.id, { delivery_instructions: text })}
                    placeholder="Instructions spécifiques pour cette livraison"
                    placeholderTextColor="#999"
                    multiline
                  />
                </View>

                {/* Informations destinataire */}
                <View style={styles.recipientGrid}>
                  <View style={styles.recipientInput}>
                    <Text style={styles.label}>Nom du destinataire *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={pkg.recipient_name}
                      onChangeText={(text) => updatePackage(pkg.id, { recipient_name: text })}
                      placeholder="Nom complet"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.recipientInput}>
                    <Text style={styles.label}>Téléphone destinataire *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={pkg.recipient_phone}
                      onChangeText={(text) => updatePackage(pkg.id, { recipient_phone: text })}
                      placeholder="+224 XXX XXX XXX"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email destinataire</Text>
                  <TextInput
                    style={styles.textInput}
                    value={pkg.recipient_email || ''}
                    onChangeText={(text) => updatePackage(pkg.id, { recipient_email: text })}
                    placeholder="email@exemple.com (optionnel)"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                  />
                </View>

                {/* Options de service */}
                <View style={styles.optionsGroup}>
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => updatePackage(pkg.id, { insurance_required: !pkg.insurance_required })}
                  >
                    <MaterialIcons
                      name={pkg.insurance_required ? "check-box" : "check-box-outline-blank"}
                      size={20}
                      color={pkg.insurance_required ? "#E31837" : "#999"}
                    />
                    <Text style={styles.optionText}>Assurance requise (+5,000 FG)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => updatePackage(pkg.id, { express_delivery: !pkg.express_delivery })}
                  >
                    <MaterialIcons
                      name={pkg.express_delivery ? "check-box" : "check-box-outline-blank"}
                      size={20}
                      color={pkg.express_delivery ? "#E31837" : "#999"}
                    />
                    <Text style={styles.optionText}>Livraison express (+10,000 FG)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => updatePackage(pkg.id, { signature_required: !pkg.signature_required })}
                  >
                    <MaterialIcons
                      name={pkg.signature_required ? "check-box" : "check-box-outline-blank"}
                      size={20}
                      color={pkg.signature_required ? "#E31837" : "#999"}
                    />
                    <Text style={styles.optionText}>Signature requise (+2,000 FG)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Résumé et prix */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>{service.name}</Text>
              <Text style={styles.summarySubtitle}>Livraison estimée: {packageInfo.delivery_time}</Text>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryDetail}>Nombre de colis: {packageInfo.packages.length}</Text>
                <Text style={styles.summaryDetail}>Destinations: {packageInfo.packages.length} adresse(s) différente(s)</Text>
                {packageInfo.pickup_date && (
                  <Text style={styles.summaryDetail}>Départ: {packageInfo.pickup_date} à {packageInfo.pickup_time}</Text>
                )}
                {packageInfo.drop_date && (
                  <Text style={styles.summaryDetail}>Livraison: {packageInfo.drop_date} à {packageInfo.drop_time}</Text>
                )}
              </View>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.priceAmount}>{packageInfo.estimated_price.toLocaleString()} FG</Text>
              <Text style={styles.priceLabel}>Prix estimé</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Création en cours...</Text>
            ) : (
              <Text style={styles.submitButtonText}>
                Confirmer ({packageInfo.packages.length} colis)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E31837',
  },
  helpCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#1976D2',
  },
  prefillButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  prefillButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
  },
  packagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E31837',
  },
  addButtonText: {
    color: '#E31837',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  packageCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  packageTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  packageTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#FFFFFF',
  },
  packageTypeButtonSelected: {
    backgroundColor: '#E31837',
    borderColor: '#E31837',
  },
  packageTypeText: {
    fontSize: 14,
    color: '#666',
  },
  packageTypeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dimensionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  weightInput: {
    flex: 1,
  },
  dimensionsInput: {
    flex: 2,
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dimensionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  recipientGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  recipientInput: {
    flex: 1,
  },
  optionsGroup: {
    marginTop: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
  },
  summaryDetails: {
    gap: 4,
  },
  summaryDetail: {
    fontSize: 12,
    color: '#1976D2',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
  },
  priceLabel: {
    fontSize: 12,
    color: '#1976D2',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#E31837',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
