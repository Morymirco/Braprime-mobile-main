import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WalletScreen() {
  const router = useRouter();
  const [balance] = useState(0);
  const [selectedMonth] = useState('September');

  const handleBack = () => {
    router.back();
  };

  const handleTopUp = () => {
    router.push('/wallet/top-up');
  };

  const handleTransfer = () => {
    router.push('/wallet/transfer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Wallet</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceAmount}>
            <Text style={styles.balanceValue}>{balance}</Text>
            <Text style={styles.balanceCurrency}> CFA</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTransfer}>
              <Ionicons name="arrow-forward-outline" size={24} color="#666" />
              <Text style={styles.actionButtonText}>Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleTopUp}>
              <Ionicons name="add" size={24} color="#666" />
              <Text style={styles.actionButtonText}>Top-up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
          <TouchableOpacity style={styles.monthSelector}>
            <Text style={styles.monthText}>{selectedMonth}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyTransactions}>
          <Text style={styles.emptyText}>You don't have any transactions yet</Text>
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
    marginBottom: 24,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  monthText: {
    fontSize: 16,
    marginRight: 4,
  },
  emptyTransactions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 