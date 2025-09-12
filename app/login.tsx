import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmailPassword, loading, error, clearError } = useAuth();

  // État pour la connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleBack = () => {
    // Rediriger vers la page d'accueil ou splash au lieu de router.back()
    // car il n'y a pas forcément d'écran précédent
    router.replace('/initial-splash');
  };

  const handleLogin = async () => {
    clearError();
    setLocalError(null);
    
    if (!email || !password) {
      setLocalError('Veuillez saisir votre email et mot de passe.');
      return;
    }
    
    const result = await signInWithEmailPassword(email, password);
    if (result.error) {
      // L'erreur sera automatiquement affichée via le contexte Auth
      // Pas besoin d'Alert.alert() car l'erreur est déjà dans le contexte
    } else {
      router.replace('/(tabs)');
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateAccount = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Adresse email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (localError) setLocalError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Mot de passe */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (localError) setLocalError(null);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {(error || localError) && (
          <Text style={styles.errorText}>{error || localError}</Text>
        )}

        {/* Bouton de connexion */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            isValidEmail(email) && password.length >= 6 && styles.continueButtonActive
          ]}
          onPress={handleLogin}
          disabled={loading || !isValidEmail(email) || password.length < 6}
        >
          <Text style={[
            styles.continueButtonText,
            isValidEmail(email) && password.length >= 6 && styles.continueButtonTextActive
          ]}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>

        {/* Lien pour créer un compte */}
        <TouchableOpacity onPress={handleCreateAccount}>
          <Text style={styles.switchText}>
            Pas de compte ? <Text style={styles.switchLink}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: '#E41E31',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonActive: {
    backgroundColor: '#E41E31',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E41E31',
  },
  continueButtonTextActive: {
    color: '#fff',
  },
  switchText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 16,
  },
  switchLink: {
    color: '#E41E31',
    fontWeight: 'bold',
  },
}); 