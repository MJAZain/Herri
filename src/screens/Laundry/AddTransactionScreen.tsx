import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { BSON } from 'realm';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { addTransaction } from '../../realm/helpers/transactionHelper';
import { getAllServices } from '../../realm/helpers/serviceHelpers';
import { getCustomerByPhoneNumber } from '../../realm/helpers/customerHelper';

type SelectedService = {
  _id: BSON.ObjectId;
  name: string;
  pricePerKg: number;
  weight: string;
};


type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

const TransactionScreen: React.FC<Props> = ({ route }) => {
  const { phoneNumber } = route.params;

  const [services, setServices] = useState<SelectedService[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
  // Fetch customer details by phoneNumber
  const customer = getCustomerByPhoneNumber(phoneNumber);
  if (customer) {
    setCustomerName(customer.name);
    setAddress(customer.address);
  }

  const serviceData = getAllServices();
  const mapped = serviceData.map((s) => ({
    _id: s._id as BSON.ObjectId,
    name: s.name as string, // Type-casting name as string
    pricePerKg: s.pricePerKg as number, // Type-casting pricePerKg as number
    weight: '',
  }));
  setServices(mapped);

  return () => {
    // Cleanup if needed
  };
}, [phoneNumber]);


  const handleWeightChange = (index: number, weight: string) => {
    const updated = [...services];
    updated[index].weight = weight;
    setServices(updated);
  };

  const handleSubmit = () => {
    const selectedServices = services
      .filter((s) => s.weight.trim() !== '')
      .map((s) => {
        const weight = parseFloat(s.weight);
        return {
          serviceId: s._id,
          name: s.name,
          pricePerKg: s.pricePerKg,
          weight,
          totalPrice: weight * s.pricePerKg,
        };
      });

    if (!selectedServices.length) {
      Alert.alert('Incomplete', 'Please select at least one service with weight.');
      return;
    }

    addTransaction(customerName, phoneNumber, address, selectedServices);

    Alert.alert('Success', 'Transaction saved!');
    setServices((prev) =>
      prev.map((s) => ({ ...s, weight: '' }))
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Transaction</Text>
      <Text>Name: {customerName}</Text>
      <Text>Address: {address}</Text>

      <Text style={styles.subTitle}>Select Services</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={({ item, index }) => (
          <View style={styles.serviceRow}>
            <Text style={styles.serviceName}>
              {item.name} ({item.pricePerKg} per kg)
            </Text>
            <TextInput
              style={styles.weightInput}
              placeholder="Weight"
              keyboardType="numeric"
              value={item.weight}
              onChangeText={(text) => handleWeightChange(index, text)}
            />
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  serviceName: {
    flex: 2,
    fontSize: 14,
  },
  weightInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
    marginLeft: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4dabf7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TransactionScreen;
