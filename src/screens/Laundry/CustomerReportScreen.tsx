import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCustomerReport } from '../../realm/helpers/useCustomerReport';

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


const CustomerReportScreen = () => {
  const { newCount, returningCount, topLoyalCustomers, customerLTVs } = useCustomerReport();

  const hasLoyalCustomers = topLoyalCustomers?.length > 0;
  const hasLTVs = customerLTVs?.length > 0;

  return (
    <FlatList
      data={hasLTVs ? customerLTVs.slice(0, 5) : []}
      keyExtractor={(item) => item.customerId.toString()}
      ListHeaderComponent={
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Laporan Pelanggan</Text>
          </View>

          <Text style={styles.section}>Pelanggan Baru vs Kembali</Text>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{newCount}</Text>
              <Text style={styles.statLabel}>Pelanggan Baru</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{returningCount}</Text>
              <Text style={styles.statLabel}>Pelanggan Kembali</Text>
            </View>
          </View>

          <Text style={styles.section}>5 Pelanggan Paling Loyal</Text>
          {hasLoyalCustomers ? (
            topLoyalCustomers.map((item) => (
              <View style={styles.row} key={item.customerId.toString()}>
                <Text style={styles.label}>{item.name}</Text>
                <Text style={styles.amount}>{item.transactions} transaksi</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Tidak ada pelanggan loyal.</Text>
          )}

          <Text style={styles.section}>Lifetime Value Pelanggan (Pengeluaran Tertinggi)</Text>
          {!hasLTVs && <Text style={styles.noData}>Tidak ada data lifetime value.</Text>}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.label}>{item.name}</Text>
          <Text style={styles.amount}>{formatRupiahCompact(item.totalSpent)}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: 'rgba(251, 247, 238, 1)', }}
    />
  );
};

export default CustomerReportScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(251, 247, 238, 1))',
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
    marginVertical: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 219, 137, 1)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    color: '#64748b',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderColor: '#eee',
    padding: 16
  },
  label: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular'
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold'
  },
  noData: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Lexend-Bold',
    paddingVertical: 4,
  },
});
