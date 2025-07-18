import React from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useExpenseReport } from '../../realm/helpers/expenseReport';
import EarningsVsExpensePie from '../../components/EarningsVsExpensePie';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend, VictoryGroup, VictoryTheme } from 'victory-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth * 0.90;

const formatRupiahCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `Rp${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (value >= 1_000_000) {
    return `Rp${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (value >= 1_000) {
    return `Rp${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  } else {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  }
};

const formatCompactIDR = (value: string): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (num >= 1_000_000_000) return `Rp${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `Rp${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `Rp${num}`;
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#3b82f6',
  },
  formatYLabel: formatCompactIDR,
};

const ExpenseReportScreen = () => {
  const { totalMonthlyExpense, breakdown, monthlyTrends } = useExpenseReport();

  const barLabels = breakdown.map((b) => b.type);
  const barData = breakdown.map((b) => b.total);

  const months = Array.from(
    new Set(
      Object.values(monthlyTrends)
        .flatMap((type) => type.map((m) => m.month))
        .sort()
    )
  );

  const lineDatasets = Object.entries(monthlyTrends).map(([type, data], idx) => ({
    data: months.map((month) => {
      const match = data.find((m) => m.month === month);
      return match ? match.total : 0;
    }),
    color: (opacity = 1) => chartColors[idx % chartColors.length](opacity),
    strokeWidth: 2,
    name: type,
  }));

  const hasLineData = lineDatasets.some(dataset => dataset.data.some(value => value > 0));

  return (
    <FlatList
      data={breakdown}
      keyExtractor={(item) => item.type}
      ListHeaderComponent={
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Laporan Pengeluaran</Text>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.label}>Total Pengeluaran Bulan ini:</Text>
              <Text style={styles.value}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalMonthlyExpense)}
              </Text>
            </View>
          </View>

          <Text style={styles.section}>Pengeluaran </Text>

          <View style={styles.chartContainer}>
            {hasLineData && months.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  contentContainerStyle={{
                    width: Math.max(chartWidth, months.length * 80),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <VictoryChart
                    width={Math.max(chartWidth, months.length * 80)}
                    height={300}
                    theme={VictoryTheme.material}
                    domainPadding={{ x: 30, y: 10 }}
                  >
                    <VictoryAxis
                      tickValues={months.map((_, i) => i)}
                      tickFormat={months}
                      style={{ tickLabels: { angle: -45, fontSize: 10, padding: 15, fontFamily:'Lexend-Regular' } }}
                    />

                    <VictoryAxis
                      dependentAxis
                      tickFormat={(tick) => formatCompactIDR(tick.toString())}
                      style={{ tickLabels: { angle: -45, fontSize: 10, fontFamily:'Lexend-Regular' } }}
                    />

                    <VictoryGroup>
                      {lineDatasets.map((dataset, idx) => (
                        <VictoryLine
                          key={idx}
                          data={dataset.data.map((y, x) => ({ x, y }))}
                          style={{
                            data: {
                              stroke: chartColors[idx % chartColors.length](),
                              strokeWidth: 2,
                            },
                          }}
                        />
                      ))}
                    </VictoryGroup>
                  </VictoryChart>
                </ScrollView>

                <View
                  style={[
                    styles.legendContainer,
                    {
                      marginTop: 8,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginHorizontal: 32
                    },
                  ]}
                >
                  {Object.keys(monthlyTrends).map((key, idx) => (
                    <View
                      key={key}
                      style={[
                        styles.legendItem,
                        {
                          width: '50%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 4,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.legendColorBox,
                          { backgroundColor: chartColors[idx % chartColors.length]() },
                        ]}
                      />
                      <Text style={styles.legendLabel}>{key}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.noDataText}>Tidak ada data pengeluaran</Text>
            )}

          </View>

          <EarningsVsExpensePie />

          <Text style={styles.section}>Rincian Pengeluaran</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.itemRow}>
          <Text style={styles.itemType}>{item.type}</Text>
          <Text style={styles.itemAmount}>{formatRupiahCompact(item.total)}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: 'rgba(251, 247, 238, 1)', }}
    />
  );
};

export default ExpenseReportScreen;

const chartColors = [
  (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
  (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
  (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
  (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
  (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
];

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center'
  },
legendContainer: {
  
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
legendColorBox: {
  width: 12,
  height: 12,
  marginRight: 6,
  borderRadius: 2,
},
legendLabel: {
  fontSize: 12,
  color: '#333',
  fontFamily: 'Lexend-Regular'
},
  container: {
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  section: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 219, 137, 1)',
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryContainer: {
    margin: 16
  },
  summaryBox: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    color: 'rgba(5, 49, 105, 1)',
    fontFamily: 'Lexend-Regular'
  },
  value: {
    fontSize: 22,
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Lexend-Bold",
    color: 'rgba(5, 49, 105, 1)',
    marginTop: 20,
    marginBottom: 8,
    padding: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#ddd',
    borderBottomWidth: 3,
    padding: 16
  },
  itemType: {
    fontFamily: "Lexend-Regular",
    color: 'rgba(5, 49, 105, 1)',
  },
  itemAmount: {
    fontSize: 16,
    fontFamily: "Lexend-Bold",
    color: 'rgba(5, 49, 105, 1)',
  },
  noDataText: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
    fontFamily: "Lexend-Bold",
    color: 'rgba(5, 49, 105, 1)',
  },
});
