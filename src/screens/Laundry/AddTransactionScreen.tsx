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
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { addTransaction } from '../../realm/helpers/transactionHelper';
import { getAllServices } from '../../realm/helpers/serviceHelpers';
import { getCustomerByPhoneNumber } from '../../realm/helpers/customerHelper';
import Toast from '../../components/toast';

type SelectedService = {
  _id: BSON.ObjectId;
  name: string;
  description: string;
  pricePerKg: number;
  weight: string;
};


type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

const TransactionScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { phoneNumber } = route.params;

  const [services, setServices] = useState<SelectedService[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
  const customer = getCustomerByPhoneNumber(phoneNumber);
  if (customer) {
    setCustomerName(customer.name);
    setAddress(customer.address);
    setPhone(customer.phoneNumber);
  }

  const serviceData = getAllServices();
  const mapped = serviceData.map((s) => ({
    _id: s._id as BSON.ObjectId,
    name: s.name as string,
    description: s.description as string,
    pricePerKg: s.pricePerKg as number,
    weight: '',
  }));
  setServices(mapped);

  return () => {
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
          description: s.description,
          weight,
          totalPrice: weight * s.pricePerKg,
        };
      });

    if (!selectedServices.length) {
      showToast('Data pesanan tidak lengkap', 'error');
      return;
    }

    addTransaction(customerName, phoneNumber, address, selectedServices);

    setServices((prev) =>
      prev.map((s) => ({ ...s, weight: '' }))
    );
   
    navigation.navigate('MainTabs');
  };

  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Tambah Pesanan Baru</Text>
    </View>

    <View style={styles.containerInfo}>
      <Text style={styles.info}>Nama: {customerName}</Text>
      <Text style={styles.info}>Alamat: {address}</Text>
      <Text style={styles.info}>No. Hp: {phone}</Text>
    </View>

    <View style={styles.layanan}>
      <Text style={styles.layananTitle}>Pilih Layanan</Text>
    </View>

 
    <View style={styles.flexList}>
      <FlatList
        contentContainerStyle={styles.list} // keep padding here
        data={services}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={({ item, index }) => (
          <View style={styles.serviceRow}>
            <View>
              <Text style={styles.cell}>{item.name}</Text>
              <Text style={styles.cell}>{item.description}</Text>
              <Text style={styles.cell}>({item.pricePerKg} per kg)</Text>
            </View>
            <TextInput
              style={styles.weightInput}
              placeholder="Berat"
              placeholderTextColor='rgba(44, 87, 140, 0.5)'
              keyboardType="numeric"
              value={item.weight}
              onChangeText={(text) => handleWeightChange(index, text)}
            />
          </View>
        )}
      />
    </View>

    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Simpan Pesanan</Text>
      </TouchableOpacity>
    </View>

    <Toast
      message={toastMessage}
      type={toastType}
      visible={toastVisible}
      onClose={() => setToastVisible(false)}
    />
  </View>
);

};

const styles = StyleSheet.create({
  flexList: {
  flex: 1,
},
list: {
  padding: 16,
  paddingBottom: 100
},
header: {
  paddingVertical: 16,
  paddingHorizontal: 20,
  backgroundColor: 'rgba(44, 87, 140, 1)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 2.8,
  elevation: 5,
  zIndex: 10,
},
containerInfo: {
  padding: 16,
  borderBottomWidth: 4,
  borderColor: '#eee',
},
layanan: {
  paddingVertical: 16,
  paddingHorizontal: 20,
  zIndex: 10,
  borderBottomWidth: 4,
  borderColor: '#eee',
},
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  
  info: {
    fontFamily: 'Lexend-Bold'
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Lexend-Bold'
  },
  layananTitle: {
    fontSize: 20,
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Bold'
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
    borderBottomWidth: 5,
    borderColor: '#eee',
  },
  cell: { 
    paddingVertical: 5,
    fontFamily: 'Lexend-Regular',
    flex: 1
  },
  weightInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
    marginLeft: 10,
    backgroundColor: '#fff',
    maxWidth: '50%'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'rgba(110, 134, 170, 1)',
    fontFamily: 'Lexend-Bold'
  },
});

export default TransactionScreen;
