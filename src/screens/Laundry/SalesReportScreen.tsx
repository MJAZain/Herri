import React from 'react';
import { View, Text, FlatList, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useServiceSalesReport } from '../../realm/helpers/useServiceSalesReport';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryLegend,
  VictoryGroup,
  VictoryTheme
} from 'victory-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth * 0.90;

const formatCompactIDR = (yLabel: string): string => {
  const value = parseFloat(yLabel);
  if (isNaN(value)) return yLabel;

  if (value >= 1_000_000_000) {
    return `Rp${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (value >= 1_000_000) {
    return `Rp${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `Rp${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `Rp${value}`;
};

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

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
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

const SalesReportScreen = () => {
  const { breakdown, monthlyTrends } = useServiceSalesReport();

  const months = Array.from(
    new Set(
      Object.values(monthlyTrends)
        .flatMap((type) => type.map((m) => m.month))
        .sort(),
    ),
  );

  const lineDatasets = Object.entries(monthlyTrends).map(([service, data], idx) => ({
    data: months.map((month) => {
      const found = data.find((d) => d.month === month);
      return found ? found.total : 0;
    }),
    color: (opacity = 1) => chartColors[idx % chartColors.length](opacity),
    strokeWidth: 2,
    name: service,
  }));

  const hasLineData = lineDatasets.some(dataset => dataset.data.some(val => val > 0));

  return (
    <FlatList
      data={breakdown}
      keyExtractor={(item) => item.name}
      ListHeaderComponent={
        <View style={styles.containerSales}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Laporan Penjualan</Text>
          </View>

          <Text style={styles.section}>Tren Penjualan Layanan</Text>
          <View style={styles.container}>
              {hasLineData ? (
                <>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{
                      width: Math.max(chartWidth, months.length * 80),
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
                        style={{
                          tickLabels: { angle: -45, fontSize: 10, padding: 15, fontFamily: 'Lexend-Regular' },
                        }}
                      />

                      <VictoryAxis
                        dependentAxis
                        tickFormat={(tick) => formatCompactIDR(tick.toString())}
                        style={{
                          tickLabels: { angle: -45, fontSize: 10, padding: 15, fontFamily: 'Lexend-Regular' },
                        }}
                      />

                      <VictoryGroup>
                        {lineDatasets.map((dataset, idx) => (
                          <VictoryLine
                            key={idx}
                            data={dataset.data.map((y, x) => ({ x, y }))}
                            style={{
                              data: {
                                stroke: chartColors[idx % chartColors.length](),
                                strokeWidth: dataset.strokeWidth,
                              },
                            }}
                          />
                        ))}
                      </VictoryGroup>
                    </VictoryChart>
                  </ScrollView>

                  {/* Legend BELOW the chart, styled in 2 columns */}
                  <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 32 }}>
                    {Object.keys(monthlyTrends).map((key, idx) => (
                      <View
                        key={key}
                        style={[styles.legendItem, { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 4 }]}
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
                <Text style={styles.noDataText}>Belum ada data</Text>
              )}
          </View>

          <Text style={styles.section}>Rincian Penjualan</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.label}>{item.name}</Text>
          <Text style={styles.amount}>{formatRupiahCompact(item.totalSales)}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: 'rgba(251, 247, 238, 1)', }}
    />
  );
};

export default SalesReportScreen;

const chartColors = [
  (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
  (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
  (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
  (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
  (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
];

const styles = StyleSheet.create({
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
legendColorBox: {
  width: 12,
  height: 12,
  marginRight: 4,
  borderRadius: 2,
},
legendLabel: {
  fontSize: 12,
  color: '#333',
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
    fontFamily: 'Lexend-Bold',
  },
  container: {

    backgroundColor: 'rgba(251, 247, 238, 1)',
    alignItems: 'center'
  },
  containerSales: {
    backgroundColor: 'rgba(251, 247, 238, 1)'
  },
  section: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 219, 137, 1)',
  },
  chart: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 3,
    borderColor: '#eee',
    
  },
  label: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
    fontFamily: 'Lexend-Regular',
  },
});
