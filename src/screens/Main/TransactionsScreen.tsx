import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getAllTransactions } from '../../realm/helpers/transactionHelper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import Realm from 'realm';

import TransactionBG from '../../../assets/icons/transactionicon/TransactionBG.svg'

type Props = {
  status: string | string[];
  title: string;
};

const TransactionScreen: React.FC<Props> = ({ status, title }) => {
  const [transactions, setTransactions] = useState<Realm.Results<Realm.Object> | any[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const realmResults = getAllTransactions();
    const filterQuery = Array.isArray(status)
      ? status.map((s) => `status == "${s}"`).join(' OR ')
      : `status == "${status}"`;

    const filtered = realmResults.filtered(filterQuery);
    setTransactions([...filtered]);

    const listener = () => setTransactions([...filtered]);
    filtered.addListener(listener);

    return () => filtered.removeListener(listener);
  }, [status]);

  const handlePress = (id: string) => {
    navigation.navigate('TransactionDetail', { transactionId: id });
  };

  return (
    <View style={styles.container}>

      <View style={[StyleSheet.absoluteFill]} pointerEvents="none">
        <TransactionBG width="100%" height="100%" preserveAspectRatio="xMidYMid meet"/>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Nama</Text>
        <Text style={styles.headerText}>Status</Text>
        <Text style={styles.headerText}>Total</Text>
        <Text style={styles.headerText}>Tanggal</Text>
      </View>
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id.toHexString()}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(item._id.toHexString())}
          >
            <Text style={styles.cell}>{item.customer.name}</Text>
            <Text style={styles.cell}>{item.status}</Text>
            <Text style={styles.cell}>Rp {item.totalPrice.toLocaleString()}</Text>
            <Text style={styles.cell}>{new Date(item.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Tidak ada transaksi dengan status {Array.isArray(status) ? status.join(', ') : status}.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
    padding: 16
  },
headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(110, 134, 170, 1)',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.6,
    elevation: 2,
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    color: '#fff',
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(240, 248, 252, 0.9)',
    padding: 16,
    borderRadius: 8,
    borderBottomWidth: 5,
    borderColor: '#eee',
  },
  cell: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Lexend-Regular'
  },
});

export default TransactionScreen;
