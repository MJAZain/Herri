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
          <Text style={styles.title}>Edit Layanan</Text>

          <TextInput
          placeholder="Nama Layanan (Maks 20 Karakter)"
          maxLength={20}
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Deskripsi"
            style={styles.input}
            value={description}
            multiline={true}
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
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Simpan</Text>
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Lexend-Regular'
  },
  input: {
 backgroundColor: '#fff',
    borderColor: 'rgba(44, 87, 140, 1)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 3,
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    padding: 6,
  },
  cancelButton: {
    marginLeft: 12,
  },
  saveButton: {
    marginLeft: 12,
  },
  buttonText: {
    color: 'rgba(44, 87, 140, 1)',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Lexend-Regular',
    padding: 6
  },
});

export default EditServiceModal;


