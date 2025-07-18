import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity  } from 'react-native';
import { useMonthlyFinance } from '../../realm/helpers/moneyreportHelper';
import { useTransactionStats } from '../../realm/helpers/transactionReportHelper'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../App'

import BatalIcon from '../../../assets/icons/reporticon/BatalIcon.svg'
import MasukIcon from '../../../assets/icons/reporticon/MasukIcon.svg'
import MenungguIcon from '../../../assets/icons/reporticon/MenungguIcon.svg'
import OmsetIcon from '../../../assets/icons/reporticon/OmsetIcon.svg'
import RiwayatIcon from '../../../assets/icons/reporticon/RiwayatIcon.svg'

import PengeluaranIcon from '../../../assets/icons/reporticon/PengeluaranIcon.svg'
import PendapatanIcon from '../../../assets/icons/reporticon/PendapatanIcon.svg'
import ExpenseIcon from '../../../assets/icons/settingsicon/ExpenseIcon.svg'

import ExpenseReportIcon from '../../../assets/icons/reporticon/ExpenseReportIcon.svg'
import TransaksiReportIcon from '../../../assets/icons/reporticon/TransaksiReportIcon.svg'
import PelangganReportIcon from '../../../assets/icons/reporticon/PelangganReportIcon.svg'

const ReportScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { expensesFormatted, earningsFormatted, profitFormatted } = useMonthlyFinance();
  const { monthlyCount, waitingCount, canceledCount } = useTransactionStats();

  return (
    <View style={styles.container}>

      <View style={styles.dashboardContainer}>
        <Text style={styles.dashboardTitle}>Laporan Bulan Ini</Text>
          <View style={styles.dashboard}>
            <View style={styles.item}>
              <OmsetIcon />
              <Text style={styles.label}>Omset</Text>
              <Text style={styles.value}>{earningsFormatted}</Text>
            </View>

            <View style={styles.item}>
              <PendapatanIcon />
              <Text style={styles.label}>Pendapatan</Text>
              <Text style={styles.value}>{profitFormatted}</Text>
            </View>

            <View style={styles.item}>
              <PengeluaranIcon />
              <Text style={styles.label}>Pengeluaran</Text>
              <Text style={styles.value}>{expensesFormatted}</Text>
            </View>

            <View style={styles.item}>
              <MasukIcon />
              <Text style={styles.label}>Order Masuk</Text>
              <Text style={styles.value}>{monthlyCount}</Text>
            </View>

            <View style={styles.item}>
              <BatalIcon />
              <Text style={styles.label}>Order Batal</Text>
              <Text style={styles.value}>{canceledCount}</Text>
            </View>

            <View style={styles.item}>
              <MenungguIcon />
              <Text style={styles.label}>Belum Diambil</Text>
              <Text style={styles.value}>{waitingCount}</Text>
            </View>
        </View>
      </View>
      
      
      <View style={styles.report}>
        <Text style={styles.reportTitle}>Laporan</Text>

        <TouchableOpacity style={styles.reportItem} onPress={() => navigation.navigate('SalesReport')}>
          <TransaksiReportIcon width={24} height={24} />
          <Text style={styles.reportlabel}>Penjualan</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.reportItem} onPress={() => navigation.navigate('ExpenseReport')}>
          <ExpenseReportIcon width={24} height={24} />
          <Text style={styles.reportlabel}>Keuangan</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.reportItem} onPress={() => navigation.navigate('CustomerReport')}>
          <PelangganReportIcon width={24} height={24} />
          <Text style={styles.reportlabel}>Pelanggan</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>

    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(251, 247, 238, 1)',
    flex: 1,
    fontFamily: 'Lexend',
  },
  dashboardContainer: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.25,
    shadowRadius: 12.8,
    elevation: 5,
    borderRadius: 10,
    marginVertical: 25
  },
  dashboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardTitle: {
    color: 'rgba(251, 247, 238, 1)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  item: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  value: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  report: {
    backgroundColor: 'rgba(242, 250, 254, 1)',
    padding: 20,
    borderRadius: 10,
    height: "100%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 5.6,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c578c',
    textAlign: 'center',
    marginBottom: 20
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportlabel: {
    fontSize: 16,
    color: '#2c578c',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(44, 87, 140, 0.3)',
    marginVertical: -4,
    marginBottom: 20,
  },
});
