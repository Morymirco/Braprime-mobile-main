import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type MapOption = 'google' | 'apple';

export default function ProfileScreen() {
  const [showMapModal, setShowMapModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMap, setSelectedMap] = useState<MapOption>('google');
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {/* Language */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="language" size={24} color="black" />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Chat with us */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
            <Text style={styles.settingText}>Chat with us</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Payment Methods */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowPaymentModal(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="card-outline" size={24} color="black" />
            <Text style={styles.settingText}>Payment Methods</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Default map application */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowMapModal(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="map-outline" size={24} color="black" />
            <Text style={styles.settingText}>Default map application</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Subscription settings */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="mail-outline" size={24} color="black" />
            <Text style={styles.settingText}>Subscription settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Terms & Services */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="document-text-outline" size={24} color="black" />
            <Text style={styles.settingText}>Terms & Services</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="lock-closed-outline" size={24} color="black" />
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMapModal}
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>Default map application</Text>
            <Text style={styles.modalSubtitle}>Will be opened to display address of the order</Text>

            {/* Map Options */}
            <View style={styles.optionsContainer}>
              {/* Google Maps Option */}
              <TouchableOpacity 
                style={styles.optionRow}
                onPress={() => setSelectedMap('google')}
              >
                <View style={styles.optionLeft}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1592910147752-5e6cc17c269f?w=64&h=64&fit=crop' }}
                    style={styles.mapIcon}
                  />
                  <Text style={styles.optionText}>Google maps</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedMap === 'google' && styles.radioButtonSelected
                ]} />
              </TouchableOpacity>

              {/* Apple Maps Option */}
              <TouchableOpacity 
                style={styles.optionRow}
                onPress={() => setSelectedMap('apple')}
              >
                <View style={styles.optionLeft}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1633488973949-88ef4aa4e876?w=64&h=64&fit=crop' }}
                    style={styles.mapIcon}
                  />
                  <Text style={styles.optionText}>Apple Maps</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedMap === 'apple' && styles.radioButtonSelected
                ]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowMapModal(false)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>Add New Card</Text>

            {/* Card Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="JOHN DOE"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.saveButtonText}>Save Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  settingsList: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 18,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  radioButtonSelected: {
    borderColor: '#E41E31',
    backgroundColor: '#E41E31',
  },
  saveButton: {
    backgroundColor: '#E41E31',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
}); 