import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../../../App'
import { useMonthlyFinance } from '../../realm/helpers/moneyreportHelper'
import { getUser } from '../../realm/helpers/userHelpers'
import { useTransactionStats } from '../../realm/helpers/transactionReportHelper'

import TransactionIcon from '../../../assets/icons/TransactionIcon.svg'
import TambahPengeluaranIcon from '../../../assets/icons/TambagPengeluaranIcon.svg'
import CariTransaksiIcon from '../../../assets/icons/CariTransaksi.svg'
import DefaultPFPIcon from '../../../assets/icons/DefaultPFP.svg'
import HomeBG from '../../../assets/icons/homepage/HomeBG.svg'

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { earningsFormatted } = useMonthlyFinance()
  const [user, setUser] = useState<any>(null)
  const { monthlyCount, completedCount, queueCount } = useTransactionStats();

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
  }, [])

  return (
    <View style={styles.container}>

      {/* Background SVG */}
      <View style={[StyleSheet.absoluteFill, { top: 400 }]} pointerEvents="none">
        <HomeBG width="100%" height="150%" />
      </View>

      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.name || 'Nama Pemilik'}</Text>
          <Text style={styles.shop}>{user?.shopName || 'Nama Toko'}</Text>
        </View>
        {user?.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
        ) : (
          <DefaultPFPIcon style={styles.avatar} />
        )}
      </View>

      <View style={styles.dashboardContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Omzet Bulan Ini:</Text>
          <Text style={styles.value}>{earningsFormatted}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{monthlyCount}</Text>
            <Text style={styles.statLabel}>Pesanan Masuk</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Pesanan Selesai</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{queueCount}</Text>
            <Text style={styles.statLabel}>Antrian Pesanan</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainMenuContainer}>
        <View style={styles.menuRow}>

          <View style={styles.menuButton}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CustomerInput')}>
            <TransactionIcon width={32} height={26}/>
            </TouchableOpacity>
            <Text style={styles.menuText}>Tambah</Text>
            <Text style={styles.menuText}>Transaksi</Text>
          </View>
          
          <View style={styles.menuButton}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AddExpense')}>
              <TambahPengeluaranIcon width={32} height={26} />
            </TouchableOpacity>
            <Text style={styles.menuText}>Tambah</Text>
            <Text style={styles.menuText}>Pengeluaran</Text>
          </View>
          
          <View style={styles.menuButton}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SearchTabs')}>
              <CariTransaksiIcon width={32} height={26} />
            </TouchableOpacity>
            <Text style={styles.menuText}>Cari</Text>
            <Text style={styles.menuText}>Transaksi</Text>
          </View>
          
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
    alignItems: 'center', 
  },
  dashboardContainer: {
    backgroundColor: 'rgba(234, 236, 233, 1)',
    transform: [{ translateY: 100 }],
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    margin: 16,
    width: '75%'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'left'
  },
  value: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(44, 87, 140, 0.3)',
    marginVertical: -4,
    marginBottom: 20
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
  statValue: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend',
    fontWeight: '500',
    fontSize: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 87, 140, 1)',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  userInfo: {
    flexDirection: 'column',
  },
  name: {
    fontFamily: 'Lexend-Regular',
    fontWeight: '500',
    fontSize: 20,
    color: 'rgba(251, 247, 238, 1)',
  },
  shop: {
    fontFamily: 'Lexend-Regular',
    fontWeight: '500',
    fontSize: 20,
    color: 'rgba(251, 247, 238, 1)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  item: {
    fontSize: 18,
    marginVertical: 10,
    color: '#000',
    fontFamily: 'Lexend-Regular',
  },
  mainMenuContainer: {
    backgroundColor: 'rgba(110, 134, 170, 1)',
    width: 321,
    height: 389,
    borderRadius: 21,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 9.9,
    elevation: 5,
    position: 'absolute',
    top: 366,
    left: 41,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItem: {
    backgroundColor: 'rgba(251, 247, 238, 1)',
    borderRadius: 12,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: 'rgba(19, 52, 42, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4.57,
    elevation: 4,
    marginBottom: 10,
  },
  menuText: {
    color: 'rgba(224, 242, 226, 1)',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
    marginTop: 0,
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
  }
})
