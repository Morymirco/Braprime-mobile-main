import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService, SignupData } from '../lib/services/AuthService';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone_number: string;
  address: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone_number?: string;
  address?: string;
}

export default function SignupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    address: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Le nom est requis';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (step === 3) {
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = 'Le numéro de téléphone est requis';
      } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Format de téléphone invalide';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'L\'adresse est requise';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSignup = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    try {
      const signupData: SignupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone_number: formData.phone_number || undefined,
        address: formData.address || undefined
      };

      console.log('🚀 [SignupScreen] Tentative d\'inscription pour:', signupData.email);
      
      let result;
      try {
        result = await AuthService.signup(signupData);
        console.log('📋 [SignupScreen] Résultat de l\'inscription:', result);
        
        // S'assurer que le résultat est toujours un objet valide
        if (!result) {
          result = { user: null, error: 'Aucune réponse du service d\'authentification' };
        }
      } catch (serviceError) {
        console.error('❌ [SignupScreen] Erreur lors de l\'appel AuthService:', serviceError);
        result = { 
          user: null, 
          error: serviceError instanceof Error ? serviceError.message : 'Erreur de connexion au service d\'authentification' 
        };
      }

      // À ce stade, result est garanti d'être un objet valide avec user et error
      if (result.user) {
        console.log('✅ [SignupScreen] Inscription réussie pour:', result.user.email);
        Alert.alert(
          'Succès',
          'Compte client créé avec succès ! Vous pouvez maintenant vous connecter.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
      } else {
        console.error('❌ [SignupScreen] Échec de l\'inscription:', result.error);
        Alert.alert('Erreur', result.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error('❌ [SignupScreen] Erreur inattendue:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Profil</Text>
      </View>
      
      <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
      
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Sécurité</Text>
      </View>
      
      <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
      
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Contact</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Informations personnelles</Text>
      <Text style={styles.stepDescription}>
        Commençons par vos informations de base pour créer votre compte client.
      </Text>

      {/* Nom */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nom complet"
          placeholderTextColor="#999"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Informations sur le compte client */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.infoText}>
          Vous créez un compte client pour commander vos plats préférés et suivre vos livraisons.
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Sécurité du compte</Text>
      <Text style={styles.stepDescription}>
        Créez un mot de passe sécurisé pour protéger votre compte.
      </Text>

      {/* Mot de passe */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#999"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry={!showPassword}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Confirmation du mot de passe */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#999"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          secureTextEntry={!showConfirmPassword}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      {/* Indicateur de force du mot de passe */}
      <View style={styles.passwordStrengthContainer}>
        <Text style={styles.passwordStrengthLabel}>Force du mot de passe:</Text>
        <View style={styles.passwordStrengthBars}>
          {[1, 2, 3].map((level) => (
            <View
              key={level}
              style={[
                styles.passwordStrengthBar,
                formData.password.length >= level * 2 && styles.passwordStrengthBarActive,
                formData.password.length >= 6 && level === 3 && styles.passwordStrengthBarStrong
              ]}
            />
          ))}
        </View>
        <Text style={styles.passwordStrengthText}>
          {formData.password.length < 6 ? 'Faible' : 
           formData.password.length < 8 ? 'Moyen' : 'Fort'}
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Informations de contact</Text>
      <Text style={styles.stepDescription}>
        Ajoutez vos informations de contact pour une meilleure expérience de livraison.
      </Text>

      {/* Téléphone */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Numéro de téléphone"
          placeholderTextColor="#999"
          value={formData.phone_number}
          onChangeText={(value) => handleInputChange('phone_number', value)}
          keyboardType="phone-pad"
          editable={!isLoading}
        />
      </View>
      {errors.phone_number && <Text style={styles.errorText}>{errors.phone_number}</Text>}

      {/* Adresse */}
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Adresse de livraison"
          placeholderTextColor="#999"
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isLoading}
        />
      </View>
      {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

      {/* Informations sur la livraison */}
      <View style={styles.infoContainer}>
        <Ionicons name="car-outline" size={20} color="#34C759" />
        <Text style={styles.infoText}>
          Votre adresse nous permet de vous proposer les meilleurs restaurants et commerces à proximité.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte client</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePreviousStep}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Précédent</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 3 ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNextStep}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>Suivant</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.primaryButtonText}>Création...</Text>
                ) : (
                  <Text style={styles.primaryButtonText}>Créer mon compte</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={handleBackToLogin} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Déjà un compte ? <Text style={styles.loginLinkBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  backButton: {
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#E41E31',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
  },
  stepLabelActive: {
    color: '#E41E31',
    fontWeight: '600',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#E41E31',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContent: {
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    padding: 5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#E41E31',
    marginLeft: 12,
    lineHeight: 20,
  },
  passwordStrengthContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  passwordStrengthBars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  passwordStrengthBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginRight: 8,
  },
  passwordStrengthBarActive: {
    backgroundColor: '#FF9500',
  },
  passwordStrengthBarStrong: {
    backgroundColor: '#34C759',
  },
  passwordStrengthText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#E41E31',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFE5E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E41E31',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkBold: {
    color: '#E41E31',
    fontWeight: '600',
  },
}); 