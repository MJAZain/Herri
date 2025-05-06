import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMonthlyFinance } from '../../realm/helpers/moneyreportHelper';

const ReportScreen = () => {
  const { expensesFormatted, earningsFormatted, profitFormatted } = useMonthlyFinance();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Pengeluaran Bulan Ini:</Text>
      <Text style={styles.value}>{expensesFormatted}</Text>

      <Text style={styles.label}>Total Pendapatan Bulan Ini:</Text>
      <Text style={styles.value}>{earningsFormatted}</Text>

      <Text style={styles.label}>Keuntungan Bulanan:</Text>
      <Text style={styles.value}>{profitFormatted}</Text>
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  label: {
    fontSize: 18,
    marginTop: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
