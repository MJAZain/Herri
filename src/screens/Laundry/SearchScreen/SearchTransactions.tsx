import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { getAllTransactions } from '../../../realm/helpers/transactionHelper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../App';
import { Transaction } from '../../../realm/types';
import Realm from 'realm';

const SearchTransactionsScreen: React.FC = () => {
  const [sections, setSections] = useState<{ title: string; data: Transaction[] }[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const realmResults = getAllTransactions();

    const processTransactions = () => {
      const cloned = realmResults.map(item => ({
        _id: item._id,
        customer: { ...item.customer },
        services: item.services.map(svc => ({ ...svc })),
        totalWeight: item.totalWeight,
        totalPrice: item.totalPrice,
        createdAt: item.createdAt,
        status: item.status,
      }));

      // Group by month
      const grouped = cloned.reduce((acc: { [key: string]: Transaction[] }, transaction: Transaction) => {
        const date = new Date(transaction.createdAt);
        const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(transaction);
        return acc;
      }, {});

      // Convert to SectionList format
      const sectionArray = Object.entries(grouped).map(([title, data]) => ({
        title,
        data,
      }));

      // Sort sections by date (descending)
      sectionArray.sort((a, b) => {
        const aDate = new Date(a.data[0].createdAt);
        const bDate = new Date(b.data[0].createdAt);
        return bDate.getTime() - aDate.getTime();
      });

      setSections(sectionArray);
    };

    processTransactions();

    const listener = () => processTransactions();
    realmResults.addListener(listener);

    return () => realmResults.removeListener(listener);
  }, []);

  const handleTransactionPress = (id: string) => {
    navigation.navigate('TransactionDetail', { transactionId: id });
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id.toHexString()}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleTransactionPress(item._id.toHexString())}
          >
            <Text style={styles.cell}>{item.customer?.name ?? 'No name'}</Text>
            <Text style={styles.cell}>{item.status ?? 'No status'}</Text>
            <Text style={styles.cell}>Rp {item.totalPrice?.toLocaleString?.() ?? 0}</Text>
            <Text style={styles.cell}>
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'No date'}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Tidak ada transaksi.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily:'Lexend-Bold',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 219, 137, 1)',
    color: 'rgba(5, 49, 105, 1)',
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
    fontFamily: 'Lexend-Regular',
  },
});

export default SearchTransactionsScreen;
