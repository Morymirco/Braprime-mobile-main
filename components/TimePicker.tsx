import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  selectedTime?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  visible,
  onClose,
  onTimeSelect,
  selectedTime
}) => {
  const [tempSelectedTime, setTempSelectedTime] = useState<string | undefined>(selectedTime);

  // Générer les heures de 8h à 20h
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  
  // Générer les minutes par tranches de 30 minutes
  const minutes = ['00', '30'];

  const formatTime = (hour: number, minute: string) => {
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  };

  const isTimeSelected = (hour: number, minute: string) => {
    if (!tempSelectedTime) return false;
    return tempSelectedTime === formatTime(hour, minute);
  };

  const handleTimePress = (hour: number, minute: string) => {
    const time = formatTime(hour, minute);
    setTempSelectedTime(time);
  };

  const handleConfirm = () => {
    if (tempSelectedTime) {
      onTimeSelect(tempSelectedTime);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Sélectionner une heure</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            Choisissez l'heure de livraison souhaitée
          </Text>

          {/* Grille des heures avec scroll */}
          <ScrollView 
            style={styles.timeScrollView}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.timeGrid}>
              {hours.map((hour) => (
                <View key={hour} style={styles.hourRow}>
                  {minutes.map((minute) => {
                    const time = formatTime(hour, minute);
                    const selected = isTimeSelected(hour, minute);
                    
                    return (
                      <TouchableOpacity
                        key={`${hour}-${minute}`}
                        style={[
                          styles.timeSlot,
                          selected && styles.selectedTimeSlot
                        ]}
                        onPress={() => handleTimePress(hour, minute)}
                      >
                        <Text style={[
                          styles.timeText,
                          selected && styles.selectedTimeText
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Boutons d'action */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                !tempSelectedTime && styles.confirmButtonDisabled
              ]} 
              onPress={handleConfirm}
              disabled={!tempSelectedTime}
            >
              <Text style={styles.confirmButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    height: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  timeScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  timeGrid: {
    paddingBottom: 8,
  },
  hourRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  timeSlot: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#E31837',
    borderColor: '#E31837',
  },
  timeText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E31837',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
