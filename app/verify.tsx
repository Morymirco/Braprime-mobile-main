import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/contexts/AuthContext';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, loading, error, clearError } = useAuth();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(30);

  const handleBack = () => {
    router.back();
  };

  const handleNumberPress = (num: string) => {
    if (code.length < 6) {
      setCode(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
  };

  const handleResendCode = async () => {
    if (countdown === 0 && phone) {
      clearError();
      const result = await verifyOtp(phone, ''); // Cette fonction sera modifiée pour renvoyer le code
      if (result.error) {
        Alert.alert('Erreur', 'Impossible de renvoyer le code. Veuillez réessayer.');
      } else {
        setCountdown(30);
      }
    }
  };

  useEffect(() => {
    if (code.length === 6 && phone) {
      clearError();
      const verifyCode = async () => {
        const result = await verifyOtp(phone, code);
        
        if (result.error) {
          Alert.alert(
            'Code incorrect',
            'Le code de vérification est incorrect. Veuillez réessayer.',
            [{ text: 'OK' }]
          );
          setCode('');
        } else {
          // Connexion réussie, rediriger vers l'application principale
          router.replace('/(tabs)');
        }
      };
      
      verifyCode();
    }
  }, [code, phone]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Code</Text>
        <Text style={styles.subtitle}>
          We've sent the 6 digit code to{'\n'}
          +224 {phone || '...'}
        </Text>

        {/* Code Input Dots */}
        <View style={styles.codeContainer}>
          {[...Array(6)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.codeDot,
                code[i] ? styles.codeDotFilled : null
              ]} 
            />
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Request New Code */}
        <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0 || loading}>
          <Text style={[
            styles.requestNewCode,
            countdown === 0 && !loading && styles.requestNewCodeActive
          ]}>
            {countdown > 0 
              ? `Request a new code in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
              : 'Request a new code'}
          </Text>
        </TouchableOpacity>

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
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  codeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },
  codeDotFilled: {
    backgroundColor: '#000',
  },
  errorText: {
    color: '#E41E31',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  requestNewCode: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 48,
  },
  requestNewCodeActive: {
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