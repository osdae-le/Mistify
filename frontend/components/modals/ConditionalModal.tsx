import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface ConditionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (conditions: {
    temperature?: number;
    humidity?: number;
    brightness?: number;
  }) => void;
  initialConditions?: {
    temperature?: number;
    humidity?: number;
    brightness?: number;
  };
}

const ConditionsModal: React.FC<ConditionsModalProps> = ({ 
  visible, 
  onClose, 
  onSave,
  initialConditions = {}
}) => {
  const [temperature, setTemperature] = useState(
    initialConditions.temperature !== undefined 
      ? initialConditions.temperature.toString() 
      : ''
  );
  const [humidity, setHumidity] = useState(
    initialConditions.humidity !== undefined 
      ? initialConditions.humidity.toString() 
      : ''
  );
  const [brightness, setBrightness] = useState(
    initialConditions.brightness !== undefined 
      ? initialConditions.brightness.toString() 
      : ''
  );

  const handleSave = () => {
    const conditions: {
      temperature?: number;
      humidity?: number;
      brightness?: number;
    } = {};

    if (temperature !== '') {
      conditions.temperature = parseFloat(temperature);
    }
    
    if (humidity !== '') {
      conditions.humidity = parseFloat(humidity);
    }
    
    if (brightness !== '') {
      conditions.brightness = parseFloat(brightness);
    }

    onSave(conditions);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Set Environment Conditions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#7B8DAB" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {/* Temperature Input */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Ionicons name="thermometer-outline" size={20} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Temperature (°C)</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={temperature}
                  onChangeText={setTemperature}
                  placeholder="Enter temperature threshold"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                Leave empty if temperature is not a condition
              </Text>
            </View>
            
            {/* Humidity Input */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Ionicons name="water-outline" size={20} color="#4894FE" />
                <Text style={styles.sectionTitle}>Humidity (%)</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={humidity}
                  onChangeText={setHumidity}
                  placeholder="Enter humidity threshold"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                Leave empty if humidity is not a condition
              </Text>
            </View>
            
            {/* Brightness Input */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Ionicons name="sunny-outline" size={20} color="#FFB946" />
                <Text style={styles.sectionTitle}>Brightness (lux)</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={brightness}
                  onChangeText={setBrightness}
                  placeholder="Enter brightness threshold"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                Leave empty if brightness is not a condition
              </Text>
            </View>
          </ScrollView>
          
          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>Save Conditions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    width: '100%',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  input: {
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#7B8DAB',
    marginTop: 5,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4894FE',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConditionsModal;