import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { addCustomer, getAllCustomers } from '../../realm/helpers/customerHelper';
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
  const [customers, setCustomers] = useState<Customer[]>([]);

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

    const success = await addCustomer(
      customerName.trim(),
      phoneNumber.trim(),
      address.trim()
    );

    if (success) {
      const updatedList = getAllCustomers();
      setCustomers(updatedList);
      setCustomerName('');
      setPhoneNumber('');
      setAddress('');
      navigation.navigate('AddTransaction', { phoneNumber });
    } else {
      setToastMessage('Pelanggan Sudah ada.');
      setToastType('error');
      setToastVisible(true);
    }
  };


  useEffect(() => {
    const data = getAllCustomers();
    setCustomers(data);
  }, []);

  const handleSelectCustomer = (phoneNumber: string) => {
    navigation.navigate('AddTransaction', { phoneNumber });
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Pelanggan</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
        style={styles.input}
        placeholder="Nama Pelanggan"
        placeholderTextColor='rgba(44, 87, 140, 0.5)'
        value={customerName}
        onChangeText={setCustomerName}
      />

      <TextInput
        style={styles.input}
        placeholder="No. Telp"
        placeholderTextColor='rgba(44, 87, 140, 0.5)'
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Alamat"
        placeholderTextColor='rgba(44, 87, 140, 0.5)'
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity
        style={[
          styles.button,
          customerName && phoneNumber && address ? styles.buttonActive : null,
        ]}
        onPress={handleSubmit}
        disabled={!(customerName && phoneNumber && address)}
      >
        <Text style={styles.buttonText}>Simpan Pelanggan</Text>
      </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pilih Pelanggan</Text>
      </View>

      <View style={styles.list}>
        <FlatList
        data={customers}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={({ item }) => (
          <View style={styles.customerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.cell}>{item.address}</Text>
              <Text style={styles.cell}>{item.phoneNumber}</Text>
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
      </View>
      
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
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  list: {
    padding: 8,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'rgba(44, 87, 140, 1)',
  },
  header: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Lexend-Bold'
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
    fontFamily: 'Lexend-Regular'
  },
  button: {
    backgroundColor: 'rgba(110, 134, 170, 1)',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
  },
  buttonText: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Bold'
  },
  customerCard: {
    backgroundColor: 'rgba(240, 248, 252, 0.9)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    color: '#2C578C',
  },
  cell: { fontFamily: 'Lexend-Regular'},
  selectButton: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  selectButtonText: {
    color: '#000',
    fontFamily: 'Lexend-Bold'
  },
});


export default CustomerInputScreen;
