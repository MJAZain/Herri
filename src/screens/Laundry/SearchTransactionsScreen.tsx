import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Realm } from 'realm';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { getTransactionsByCustomer } from '../../realm/helpers/transactionHelper'; // A helper function to search transactions

type Transaction = {
  _id: Realm.BSON.ObjectId;
  customer: {
    name: string;
    phoneNumber: string;
    address: string;
  };
  totalWeight: number;
  totalPrice: number;
  createdAt: Date;
  status: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SearchTransaction'>;
};

const TransactionSearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setTransactions([]);
    } else {
      // Fetch transactions by customer details based on the search query
      const result = getTransactionsByCustomer(searchQuery.trim());
      setTransactions(result);
    }
  }, [searchQuery]);

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate('TransactionDetail', { transactionId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Transactions</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Cari berdasarkan Nama, No. Hp, atau Alamat"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.transactionItem} onPress={() => handleTransactionPress(item._id.toHexString())}>
            <Text style={styles.transactionText}>
              {item.customer.name} - {item.customer.phoneNumber} - {item.customer.address}
            </Text>
            <Text style={styles.transactionText}>Total Price: {item.totalPrice}</Text>
            <Text style={styles.transactionText}>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />
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
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  transactionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
  },
  transactionText: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default TransactionSearchScreen;
