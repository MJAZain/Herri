import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllTransactions, completeTransaction, cancelTransaction } from '../../realm/helpers/transactionHelper';
import { BSON } from 'realm';

type TransactionStatus = 'pending' | 'waiting for pickup' | 'completed' | 'canceled';

interface Transaction {
  _id: BSON.ObjectId;
  customerName: string;
  totalPrice: number;
  createdAt: Date;
  status: TransactionStatus;
}

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: TransactionStatus }>({});

  useEffect(() => {
    const results = getAllTransactions().filtered("status == 'pending' OR status == 'waiting for pickup'");

    const mapped = results.map((t) => ({
      _id: t._id as BSON.ObjectId,
      customerName: t.customerName as string,
      totalPrice: t.totalPrice as number,
      createdAt: t.createdAt as Date,
      status: t.status as TransactionStatus,
    }));
    setTransactions(mapped);

    results.addListener((collection) => {
      const updated = collection.map((t) => ({
        _id: t._id as BSON.ObjectId,
        customerName: t.customerName as string,
        totalPrice: t.totalPrice as number,
        createdAt: t.createdAt as Date,
        status: t.status as TransactionStatus,
      }));
      setTransactions(updated);
    });

    return () => results.removeAllListeners();
  }, []);

  const handleStatusChange = (id: BSON.ObjectId, status: TransactionStatus) => {
    setSelectedStatus((prev) => ({ ...prev, [id.toHexString()]: status }));
  };

  const handleUpdateStatus = (id: BSON.ObjectId, status: TransactionStatus) => {
    if (status === 'completed') {
      const transaction = transactions.find(t => t._id.equals(id));
      if (transaction) {
        completeTransaction(id, transaction.totalPrice);
        Alert.alert('Completed', 'Transaction marked as completed.');
      }
    } else if (status === 'canceled') {
      cancelTransaction(id);
      Alert.alert('Canceled', 'Transaction was canceled.');
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const currentStatus = selectedStatus[item._id.toHexString()] || item.status;

    return (
      <View style={styles.item}>
        <View>
          <Text style={styles.name}>{item.customerName}</Text>
          <Text style={styles.meta}>${item.totalPrice.toFixed(2)}</Text>
          <Text style={styles.meta}>{item.createdAt.toLocaleDateString()}</Text>
        </View>
        <View style={styles.buttons}>
          <Picker
            selectedValue={currentStatus}
            style={styles.picker}
            onValueChange={(status: TransactionStatus) =>
              handleStatusChange(item._id, status)
            }
          >
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="Waiting for Pickup" value="waiting for pickup" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Canceled" value="canceled" />
          </Picker>

          <TouchableOpacity
            style={[
              styles.statusButton,
              (currentStatus === 'completed' || currentStatus === 'canceled') && styles.glowingButton,
            ]}
            onPress={() => handleUpdateStatus(item._id, currentStatus)}
          >
            <Text style={styles.btnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pending & Waiting Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No transactions found.</Text>}
      />
    </View>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
  },
  meta: {
    color: '#555',
    fontSize: 12,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  picker: {
    height: 50,
    width: 150,
  },
  statusButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 8,
  },
  glowingButton: {
    backgroundColor: '#33b5e5',
    borderColor: '#4FC3F7',
    borderWidth: 2,
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
  },
});
