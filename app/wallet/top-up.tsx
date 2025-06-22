import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const QUICK_AMOUNTS = [
  { value: 100, label: '100 CFA' },
  { value: 200, label: '200 CFA' },
  { value: 500, label: '500 CFA' },
  { value: 1000, label: '1000 CFA' },
];

export default function TopUpScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    setAmount(prev => prev + key);
  };

  const handleProceed = () => {
    // TODO: Implement payment processing
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Top-up</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceAmount}>
            <Text style={styles.balanceValue}>0</Text>
            <Text style={styles.balanceCurrency}> CFA</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            editable={false}
            placeholder="Enter amount"
          />
        </View>

        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.quickAmountButton,
                amount === item.value.toString() && styles.quickAmountButtonSelected,
              ]}
              onPress={() => handleAmountSelect(item.value)}
            >
              <Text style={styles.quickAmountText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.proceedButton, !amount && styles.proceedButtonDisabled]}
          onPress={handleProceed}
          disabled={!amount}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>

        <View style={styles.keypad}>
          {[...Array(9)].map((_, i) => (
            <TouchableOpacity
              key={i + 1}
              style={styles.keypadButton}
              onPress={() => handleKeyPress((i + 1).toString())}
            >
              <Text style={styles.keypadButtonText}>{i + 1}</Text>
              {i > 0 && (
                <Text style={styles.keypadButtonSubText}>
                  {String.fromCharCode(65 + (i - 1) * 3)}
                  {String.fromCharCode(66 + (i - 1) * 3)}
                  {String.fromCharCode(67 + (i - 1) * 3)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.keypadButton}>
            <Text style={styles.keypadButtonText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress('0')}
          >
            <Text style={styles.keypadButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeyPress('backspace')}
          >
            <Ionicons name="backspace-outline" size={24} color="black" />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  balanceAmount: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  balanceCurrency: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickAmountButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  quickAmountButtonSelected: {
    backgroundColor: '#000',
  },
  quickAmountText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  proceedButton: {
    backgroundColor: '#FFE5E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    color: '#E41E31',
    fontSize: 16,
    fontWeight: '600',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  keypadButton: {
    width: '31%',
    aspectRatio: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '500',
  },
  keypadButtonSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: -4,
  },
}); 