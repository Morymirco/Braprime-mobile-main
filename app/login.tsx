import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmailPassword, signUpWithEmailPassword, loading, error, clearError } = useAuth();

  // Step 1: email + mot de passe
  const [step, setStep] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: inscription (prénom, nom)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    if (step === 'register') {
      setStep('login');
      clearError();
    } else {
      router.back();
    }
  };

  const handleLogin = async () => {
    clearError();
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez saisir votre email et mot de passe.');
      return;
    }
    const result = await signInWithEmailPassword(email, password);
    if (result.error) {
      // Si l'utilisateur n'existe pas, proposer l'inscription
      if (result.error.message && result.error.message.toLowerCase().includes('invalid login credentials')) {
        setStep('register');
      } else {
        Alert.alert('Erreur', result.error.message || 'Erreur de connexion.');
      }
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleRegister = async () => {
    clearError();
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    const fullName = `${firstName} ${lastName}`;
    const result = await signUpWithEmailPassword(email, password, fullName);
    if (result.error) {
      Alert.alert('Erreur', result.error.message || "Erreur lors de l'inscription.");
    } else {
      Alert.alert('Inscription réussie', 'Vérifiez votre email pour confirmer votre compte.');
      setStep('login');
      setPassword('');
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{step === 'login' ? 'Connexion' : 'Inscription'}</Text>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Adresse email"
            value={email}
            onChangeText={setEmail}
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Prénom/Nom pour inscription */}
        {step === 'register' && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </>
        )}

        {/* Error Message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Bouton principal */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            isValidEmail(email) && password.length >= 6 && styles.continueButtonActive
          ]}
          onPress={step === 'login' ? handleLogin : handleRegister}
          disabled={loading || !isValidEmail(email) || password.length < 6}
        >
          <Text style={[
            styles.continueButtonText,
            isValidEmail(email) && password.length >= 6 && styles.continueButtonTextActive
          ]}>
            {loading
              ? 'Veuillez patienter...'
              : step === 'login'
                ? 'Se connecter'
                : "S'inscrire"}
          </Text>
        </TouchableOpacity>

        {/* Lien pour basculer entre connexion/inscription */}
        {step === 'login' ? (
          <TouchableOpacity onPress={() => { setStep('register'); clearError(); }}>
            <Text style={styles.switchText}>Pas de compte ? <Text style={styles.switchLink}>Créer un compte</Text></Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => { setStep('login'); clearError(); }}>
            <Text style={styles.switchText}>Déjà un compte ? <Text style={styles.switchLink}>Se connecter</Text></Text>
          </TouchableOpacity>
        )}
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