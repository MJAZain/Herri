import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { printReceipt, formatReceipt } from '../../realm/helpers/bluetoothHelper';
import {
  getTransactionById,
  updateTransactionStatus, 
  completeTransaction, 
  cancelTransaction
} from '../../realm/helpers/transactionHelper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import Toast from '../../components/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TransactionDetailProps = {
  route: RouteProp<RootStackParamList, 'TransactionDetail'>;
};

const TransactionDetailScreen: React.FC<TransactionDetailProps> = ({ route }) => {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<any>(null);
  const navigation = useNavigation();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [paperWidth, setPaperWidth] = useState<'58' | '76' | '80'>('80');


  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

useEffect(() => {
  const fetchData = async () => {
    const fetchedTransaction = await getTransactionById(transactionId);
    setTransaction(fetchedTransaction);

    const savedWidth = await AsyncStorage.getItem('PAPER_WIDTH');
    if (savedWidth === '58' || savedWidth === '76' || savedWidth === '80') {
      setPaperWidth(savedWidth);
    }
  };

  fetchData();
}, [transactionId]);

const handlePrintReceipt = async () => {
  if (!transaction) return;

  const receipt = formatReceipt(transaction, paperWidth);
  const success = await printReceipt(receipt);

  showToast(
    success ? 'Receipt printed successfully!' : 'Failed to print the receipt.',
    success ? 'success' : 'error'
  );
};


  const handleStatusUpdate = (newStatus: 'pending'|'waiting for pickup'|'completed'|'canceled') => {
  try {
    if (newStatus === 'completed') {
      updateTransactionStatus(transaction._id, newStatus);
      completeTransaction(transaction._id, transaction.totalPrice);
    }
    else if (newStatus === 'canceled') {
      updateTransactionStatus(transaction._id, newStatus);
      cancelTransaction(transaction._id);
    }
    else {
      updateTransactionStatus(transaction._id, newStatus);
    }

    const updated = getTransactionById(transaction._id);
    setTransaction(updated);
  }
  catch (err) {
    console.error(err);
    showToast('Gagal Update Status.', 'error');
  }
};

  return (
    <View style={styles.container}>
      {transaction ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detail Pesanan</Text>
          </View>
          <View style={styles.receipt}>
  <View style={styles.indentedContainer}>
    <Text style={styles.label}>Nama:</Text>
       <View style={styles.textWrapper}>
      <Text style={styles.indentedText}>{transaction.customer.name}</Text>
    </View>
  </View>
            <Text style={styles.label}>
              No. Hp: <Text style={styles.value}>{transaction.customer.phoneNumber}</Text>
            </Text>
<View style={styles.indentedContainer}>
    <Text style={styles.label}>Alamat:</Text>
    <Text style={styles.indentedText}>{transaction.customer.address}</Text>
  </View>
            <Text style={styles.label}>
              Tanggal: <Text style={styles.value}>{new Date(transaction.createdAt).toLocaleString()}</Text>
            </Text>
            <Text style={styles.label}>
              Status: <Text style={styles.value}>{transaction.status}</Text>
            </Text>

            <Text style={styles.sectionTitle}>Layanan</Text>
            {transaction.services.map((service: any, index: number) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.item}>
                  {service.name} - {service.weight} kg {service.pricePerKg}/kg = {service.totalPrice}
                </Text>
              </View>
            ))}

            <Text style={styles.summary}>Total Berat: {transaction.totalWeight}kg</Text>
            <Text style={styles.summary}>Total Harga: Rp {transaction.totalPrice.toLocaleString()}</Text>
          </View>
          
          {/* Action Buttons Based on Status */}
          <View style={styles.buttonContainer}>
          {transaction.status === 'pending' && (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleStatusUpdate('waiting for pickup')}
              >
              <Text style={styles.buttonText}>Selesaikan Proses</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => handleStatusUpdate('canceled')}
              >
                <Text style={styles.buttonText}>Batalkan</Text>
              </TouchableOpacity>
  
            </>
          )}
          {transaction.status === 'waiting for pickup' && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleStatusUpdate('completed')}
            >
              <Text style={styles.buttonText}>Selesaikan Pesanan</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.button} onPress={handlePrintReceipt}>
            <Text style={styles.buttonText}>Print Receipt</Text>
          </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text>Loading detail pesanan...</Text>
      )}

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
  receipt: {
    padding: 16,
  },
indentedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: { 
    fontSize: 16, 
    fontFamily: 'Lexend-Bold',
    marginBottom: 10,
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  indentedText: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    paddingLeft: 8,
    lineHeight: 24,
    flexShrink: 1,
  },
  item: {
    fontFamily: 'Lexend-Regular'
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
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(44, 87, 140, 1)',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  value: { 
    fontFamily: 'Lexend-Regular',
    flex: 1
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'Lexend-Bold', 
    marginVertical: 10 
  },
  serviceItem: { 
    paddingVertical: 8, 
    borderBottomWidth: 5, 
    borderBottomColor: '#eee' 
  },
  summary: { 
    fontSize: 16, 
    fontFamily: 'Lexend-Regular', 
    marginTop: 10 
  },
  button: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
    padding: 16,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#CD5C5C',
    borderWidth: 2
  },
  buttonText: { 
    color:'rgba(44, 87, 140, 1)', 
    fontFamily: 'Lexend-Bold' 
  },
});

export default TransactionDetailScreen;
