import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MapOption = 'google' | 'apple';

export default function DefaultMapModal() {
  const router = useRouter();
  const [selectedMap, setSelectedMap] = useState<MapOption>('google');

  const handleSave = () => {
    // Here you would save the selected map preference
    router.back();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          
          <Text style={styles.title}>Default map application</Text>
          <Text style={styles.subtitle}>Will be opened to display address of the order</Text>

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

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
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
}); 