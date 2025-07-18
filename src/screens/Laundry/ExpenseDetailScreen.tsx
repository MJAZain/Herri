import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { getRealm } from '../../realm';
import Realm, { BSON } from 'realm';
import { Expense } from '../../realm/types';

type Props = {
  route: RouteProp<RootStackParamList, 'ExpenseDetail'>;
};

const ExpenseDetailScreen: React.FC<Props> = ({ route }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let realm: Realm;

    const fetchExpense = async () => {
      try {
        realm = await getRealm();
        const result = realm.objectForPrimaryKey<Expense>('Expense', new BSON.ObjectId(expenseId));
        if (result) {
          setExpense(result);
        }
      } catch (error) {
        console.error('Failed to fetch expense:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();

    return () => {
      if (realm && !realm.isClosed) {
        realm.close();
      }
    };
  }, [expenseId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C578C" />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Pengeluaran tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detail Pengeluaran</Text>
      <View style={styles.list}>
        <Text style={styles.label}>Jenis:</Text>
        <Text style={styles.value}>{expense?.expenseType?.name ?? 'Unknown'}</Text>

        <Text style={styles.label}>Tanggal:</Text>
        <Text style={styles.value}>{expense.date.toLocaleString()}</Text>

        <Text style={styles.label}>Jumlah:</Text>
        <Text style={styles.value}>Rp {expense.amount.toLocaleString()}</Text>
      </View>
    </View>
  );
};

export default ExpenseDetailScreen;

const styles = StyleSheet.create({
  list: { padding: 16},
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: '#fff',
    padding: 16,
    backgroundColor: 'rgba(5, 49, 105, 1)',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Lexend-Regular',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});
