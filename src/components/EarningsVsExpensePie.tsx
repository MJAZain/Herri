import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useIncomeVsExpense } from '../realm/helpers/useIncomeVsExpense';
import { VictoryPie } from 'victory-native';

const screenWidth = Dimensions.get('window').width;

const formatCompactIDR = (value: number): string => {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `Rp${value}`;
};

const EarningsVsExpensePie = () => {
  const { totalEarnings, totalExpenses } = useIncomeVsExpense();
  const total = totalEarnings + totalExpenses;

  const pieData = [
    {
      name: 'Penghasilan',
      y: totalEarnings,
      label: '',
      color: '#4ade80',
    },
    {
      name: 'Pengeluaran',
      y: totalExpenses,
      label: '',
      color: '#f87171',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.section}>Rasio Pengeluaran/Pendapatan</Text>

      {total > 0 ? (
        <>
          <VictoryPie
            data={pieData}
            x="name"
            y="y"
            width={screenWidth - 32}
            height={220}
            innerRadius={50}
            labels={() => ''}
            colorScale={pieData.map(item => item.color)}
            padAngle={2}
          />
          <View style={styles.legendContainer}>
            {pieData.map((item, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.name}: {formatCompactIDR(item.y)}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.empty}>Belum ada Data Bulan ini</Text>
      )}
    </View>
  );
};

export default EarningsVsExpensePie;

const styles = StyleSheet.create({
  container: {
    marginTop: 16
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
  section: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
    padding: 16,
    backgroundColor: 'rgba(255, 219, 137, 1)',
  },
  title: {
    fontSize: 18,
    fontFamily: "Lexend-Bold",
    color: 'rgba(5, 49, 105, 1)',
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    fontFamily: "Lexend-Bold",
    color: 'rgba(5, 49, 105, 1)',
    marginTop: 20,
  },
  legendContainer: {
    margin: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontFamily: "Lexend-Bold",
    color: 'rgba(5, 49, 105, 1)',
  },
});
