import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Alert } from 'react-native';


type EditServiceModalProps = {
  visible: boolean;
  initialData: {
    name: string;
    description: string;
    pricePerKg: number;
  };
  onClose: () => void;
  onSave: (updates: { name: string; description: string; pricePerKg: number }) => void;
};

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  visible,
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [price, setPrice] = useState(initialData.pricePerKg.toString());

  useEffect(() => {
    setName(initialData.name);
    setDescription(initialData.description);
    setPrice(initialData.pricePerKg.toString());
  }, [initialData]);

  const handleSave = () => {
    const parsedPrice = parseFloat(price);
    if (!name.trim()) return Alert.alert('Name is required');
    if (!description.trim()) return Alert.alert('Description is required');
    if (isNaN(parsedPrice)) return Alert.alert('Invalid price per kg');

    onSave({
      name: name.trim(),
      description: description.trim(),
      pricePerKg: parsedPrice,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Service</Text>

          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Description"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            placeholder="Price per kg"
            style={styles.input}
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default EditServiceModal;


