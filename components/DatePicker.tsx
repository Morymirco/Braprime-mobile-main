import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  minDate = new Date()
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | undefined>(selectedDate);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Ajouter les jours vides du début
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!tempSelectedDate) return false;
    return date.toDateString() === tempSelectedDate.toDateString();
  };

  const handleDatePress = (date: Date) => {
    if (!isDateDisabled(date)) {
      setTempSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    if (tempSelectedDate) {
      onDateSelect(tempSelectedDate);
      onClose();
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth(currentMonth);

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
            <Text style={styles.title}>Sélectionner une date</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Navigation du mois */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <MaterialIcons name="chevron-left" size={24} color="#E31837" />
            </TouchableOpacity>
            
            <Text style={styles.monthYear}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <MaterialIcons name="chevron-right" size={24} color="#E31837" />
            </TouchableOpacity>
          </View>

          {/* Jours de la semaine */}
          <View style={styles.weekDays}>
            {dayNames.map((day) => (
              <Text key={day} style={styles.weekDay}>{day}</Text>
            ))}
          </View>

          {/* Grille du calendrier */}
          <View style={styles.calendarGrid}>
            {days.map((date, index) => {
              if (!date) {
                return <View key={index} style={styles.dayCell} />;
              }

              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    selected && styles.selectedDay,
                    disabled && styles.disabledDay,
                    isToday && styles.todayDay
                  ]}
                  onPress={() => handleDatePress(date)}
                  disabled={disabled}
                >
                  <Text style={[
                    styles.dayText,
                    selected && styles.selectedDayText,
                    disabled && styles.disabledDayText,
                    isToday && styles.todayDayText
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Boutons d'action */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                !tempSelectedDate && styles.confirmButtonDisabled
              ]} 
              onPress={handleConfirm}
              disabled={!tempSelectedDate}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 16,
    color: '#000',
  },
  selectedDay: {
    backgroundColor: '#E31837',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#ccc',
  },
  todayDay: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  todayDayText: {
    color: '#E31837',
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
