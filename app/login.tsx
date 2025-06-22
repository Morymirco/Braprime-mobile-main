import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithPhone, loading, error, clearError } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleNumberPress = (num: string) => {
    if (phoneNumber.length < 9) {
      setPhoneNumber(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleContinue = async () => {
    if (phoneNumber.length === 9) {
      clearError();
      const result = await signInWithPhone(phoneNumber);
      
      if (result.error) {
        Alert.alert(
          'Erreur de connexion',
          result.error.message || 'Une erreur est survenue lors de l\'envoi du code de vérification.',
          [{ text: 'OK' }]
        );
      } else {
        // Passer le numéro de téléphone à l'écran de vérification
        router.push({
          pathname: '/verify',
          params: { phone: phoneNumber }
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Login or create{'\n'}an account</Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.countryCode}>
            <Image 
              source={{ uri: 'https://flagcdn.com/w160/gn.png' }}
              style={styles.flag}
            />
            <Text style={styles.countryCodeText}>+224</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>

        {/* Error Message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Continue Button */}
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            phoneNumber.length === 9 && !loading && styles.continueButtonActive
          ]}
          onPress={handleContinue}
          disabled={phoneNumber.length !== 9 || loading}
        >
          <Text style={[
            styles.continueButtonText, 
            phoneNumber.length === 9 && !loading && styles.continueButtonTextActive
          ]}>
            {loading ? 'Envoi en cours...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* Terms Text */}
        <Text style={styles.termsText}>
          By clicking "Continue" you agree with our{' '}
          <Text style={styles.termsLink}>Terms and Conditions</Text>
        </Text>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', 'delete']
          ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keypadButton}
                  onPress={() => key === 'delete' ? handleDelete() : key && handleNumberPress(key)}
                  disabled={loading}
                >
                  {key === 'delete' ? (
                    <Ionicons name="backspace-outline" size={24} color="black" />
                  ) : (
                    <Text style={styles.keypadButtonText}>{key}</Text>
                  )}
                  {key === '2' && <Text style={styles.keypadSubText}>ABC</Text>}
                  {key === '3' && <Text style={styles.keypadSubText}>DEF</Text>}
                  {key === '4' && <Text style={styles.keypadSubText}>GHI</Text>}
                  {key === '5' && <Text style={styles.keypadSubText}>JKL</Text>}
                  {key === '6' && <Text style={styles.keypadSubText}>MNO</Text>}
                  {key === '7' && <Text style={styles.keypadSubText}>PQRS</Text>}
                  {key === '8' && <Text style={styles.keypadSubText}>TUV</Text>}
                  {key === '9' && <Text style={styles.keypadSubText}>WXYZ</Text>}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
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
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 8,
    borderRadius: 2,
  },
  countryCodeText: {
    fontSize: 16,
    marginRight: 4,
  },
  phoneNumber: {
    flex: 1,
    fontSize: 16,
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
  termsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 32,
  },
  termsLink: {
    color: '#E41E31',
  },
  keypad: {
    marginTop: 'auto',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keypadButton: {
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '500',
  },
  keypadSubText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
}); 