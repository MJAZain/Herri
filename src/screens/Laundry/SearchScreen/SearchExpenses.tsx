import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { getAllExpenses } from '../../../realm/helpers/expenseReport';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../App';
import { Expense } from '../../../realm/types';

const SearchExpensesScreen: React.FC = () => {
  const [sections, setSections] = useState<{ title: string; data: Expense[] }[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const realmResults = getAllExpenses();

    const processExpenses = () => {
      const cloned: Expense[] = realmResults.map(item => ({
        _id: item._id,
        amount: item.amount,
        date: item.date,
        expenseType: {
          _id: item.expenseType?._id,
          name: item.expenseType?.name ?? 'Unknown',
        },
      }));

      // Group by month
      const grouped = cloned.reduce((acc: { [key: string]: Expense[] }, expense) => {
        const date = new Date(expense.date);
        const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(expense);
        return acc;
      }, {});

      const sectionArray = Object.entries(grouped).map(([title, data]) => ({
        title,
        data,
      }));

      // Sort by most recent first
      sectionArray.sort((a, b) => {
        const aDate = new Date(a.data[0].date);
        const bDate = new Date(b.data[0].date);
        return bDate.getTime() - aDate.getTime();
      });

      setSections(sectionArray);
    };

    processExpenses();

    const listener = () => processExpenses();
    realmResults.addListener(listener);
    return () => realmResults.removeListener(listener);
  }, []);

  const handleExpensePress = (id: string) => {
    navigation.navigate('ExpenseDetail', { expenseId: id });
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
            onPress={() => handleExpensePress(item._id.toHexString())}
          >
            <Text style={styles.cell}>{item.expenseType?.name ?? 'Unknown'}</Text>
            <Text style={styles.cell}>Rp {item.amount.toLocaleString()}</Text>
            <Text style={styles.cell}>{new Date(item.date).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Tidak ada pengeluaran.</Text>
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

export default SearchExpensesScreen;
