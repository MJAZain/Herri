import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../App'
import { useMonthlyFinance } from '../../realm/helpers/moneyreportHelper'
import { getUser } from '../../realm/helpers/userHelpers'
import { UserCircleIcon } from 'react-native-heroicons/outline'

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { earningsFormatted } = useMonthlyFinance()
  const [user, setUser] = useState<any>(null)

  // Fetch user on mount
  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user?.profilePicture ? (
          <Image
            source={{ uri: user.profilePicture }}
            style={styles.avatar}
          />
        ) : (
          <UserCircleIcon color="#888" size={64} />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.name || 'Nama Pemilik'}</Text>
          <Text style={styles.shop}>{user?.shopName || 'Nama Toko'}</Text>
        </View>
      </View>

      <Text style={styles.label}>Total Pendapatan Bulan Ini:</Text>
      <Text style={styles.value}>{earningsFormatted}</Text>

      <TouchableOpacity onPress={() => navigation.navigate('CustomerInput')}>
        <Text style={styles.item}>Tambah Transaksi</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.item}>Tambah Pengeluaran</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SearchTransaction')}>
        <Text style={styles.item}>Cari Transaksi</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  userInfo: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  shop: {
    fontSize: 16,
    color: '#666',
  },
  item: {
    fontSize: 18,
    marginVertical: 10,
    color: '#000',
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
})
