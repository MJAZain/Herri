import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { printReceipt } from '../../realm/helpers/bluetoothHelper'; // Import the print function
import { getTransactionById } from '../../realm/helpers/transactionHelper';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';


type TransactionDetailProps = {
  route: RouteProp<RootStackParamList, 'TransactionDetail'>;
};

const TransactionDetailScreen: React.FC<TransactionDetailProps> = ({ route }) => {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<any>(null); // You can specify the type if available

  useEffect(() => {
    const fetchTransaction = async () => {
      const fetchedTransaction = await getTransactionById(transactionId);
      setTransaction(fetchedTransaction);
    };

    fetchTransaction();
  }, [transactionId]);

  const handlePrintReceipt = async () => {
    if (!transaction) return;

    const { customer, services, totalWeight, totalPrice, createdAt, status } = transaction;

    const receipt = `
      ------------------------------
        Transaction Receipt
      ------------------------------
      Customer: ${customer.name}
      Phone: ${customer.phoneNumber}
      Address: ${customer.address}
      
      Date: ${new Date(createdAt).toLocaleString()}
      Status: ${status}

      ------------------------------
      Services:
      ------------------------------
      ${services
        .map(
          (service: any) =>
            `${service.name} x ${service.weight}kg @ ${service.pricePerKg}/kg = ${service.totalPrice}`
        )
        .join('\n')}

      ------------------------------
      Total Weight: ${totalWeight}kg
      Total Price: Rp ${totalPrice.toLocaleString()}

      ------------------------------
    `;

    const success = await printReceipt(receipt);
    if (success) {
      Alert.alert('Success', 'Receipt printed successfully!');
    } else {
      Alert.alert('Error', 'Failed to print the receipt.');
    }
  };

  return (
    <View style={styles.container}>
      {transaction ? (
        <>
          <Text style={styles.title}>Transaction Details</Text>

          <Text style={styles.label}>Customer Name: <Text style={styles.value}>{transaction.customer.name}</Text></Text>
          <Text style={styles.label}>Phone Number: <Text style={styles.value}>{transaction.customer.phoneNumber}</Text></Text>
          <Text style={styles.label}>Address: <Text style={styles.value}>{transaction.customer.address}</Text></Text>
          <Text style={styles.label}>Date: <Text style={styles.value}>{new Date(transaction.createdAt).toLocaleString()}</Text></Text>
          <Text style={styles.label}>Status: <Text style={styles.value}>{transaction.status}</Text></Text>

          <Text style={styles.sectionTitle}>Services</Text>
          {transaction.services.map((service: any, index: number) => (
            <View key={index} style={styles.serviceItem}>
              <Text>{service.name} - {service.weight} kg @ {service.pricePerKg}/kg = {service.totalPrice}</Text>
            </View>
          ))}

          <Text style={styles.summary}>Total Weight: {transaction.totalWeight}kg</Text>
          <Text style={styles.summary}>Total Price: Rp {transaction.totalPrice.toLocaleString()}</Text>

          <TouchableOpacity style={styles.button} onPress={handlePrintReceipt}>
            <Text style={styles.buttonText}>Print Receipt</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Loading transaction details...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: '600', marginVertical: 2 },
  value: { fontWeight: 'normal' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  serviceItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  summary: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  button: {
    backgroundColor: '#4dabf7',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default TransactionDetailScreen;
