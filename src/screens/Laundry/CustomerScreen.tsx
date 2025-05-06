import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { addOrUpdateCustomer, getAllCustomers } from '../../realm/helpers/customerHelper';
import Toast from '../../components/toast';

type Customer = {
  _id: Realm.BSON.ObjectId;
  name: string;
  address: string;
  phoneNumber: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerInput'>;
};

const CustomerInputScreen: React.FC<Props> = ({ navigation }) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isToastVisible, setToastVisible] = useState(false);
  

  const handleSubmit = async () => {
    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      setToastMessage('Please fill in all customer details.');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const success = await addOrUpdateCustomer(customerName.trim(), phoneNumber.trim(), address.trim());
    if (success) {
      setToastMessage('Customer details saved.');
      setToastType('success');
      setToastVisible(true);
      const updatedList = getAllCustomers();
      setCustomers(updatedList);
      setCustomerName('');
      setPhoneNumber('');
      setAddress('');
      navigation.navigate('AddTransaction', { phoneNumber });
    } else {
      setToastMessage('There was an issue saving the customer details.');
      setToastType('error');
      setToastVisible(true);
    }
  };

  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const data = getAllCustomers();
    setCustomers(data);
  }, []);

  const handleSelectCustomer = (phoneNumber: string) => {
    navigation.navigate('AddTransaction', { phoneNumber });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informasi Pelanggan</Text>

      <TextInput
        style={styles.input}
        placeholder="Nama Pelanggan"
        value={customerName}
        onChangeText={setCustomerName}
      />

      <TextInput
        style={styles.input}
        placeholder="No. Telp"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Alamat"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Customer</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Pilih Pelanggan</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={({ item }) => (
          <View style={styles.customerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.address}</Text>
              <Text>{item.phoneNumber}</Text>
            </View>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelectCustomer(item.phoneNumber)}
            >
              <Text style={styles.selectButtonText}>Pilih</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Toast
        message={toastMessage}
        type={toastType}
        visible={isToastVisible}
        onClose={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4dabf7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#38b000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default CustomerInputScreen;
