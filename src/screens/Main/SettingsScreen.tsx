import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../App'

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengaturan</Text>

      <Text style={styles.item}>Profile</Text>

      <TouchableOpacity onPress={() => navigation.navigate('ServiceManagement')}>
        <Text style={styles.item}>Layanan</Text>
      </TouchableOpacity>

      <Text style={styles.item}>Keuangan</Text>

      <Text style={styles.item}>Pelanggan</Text>
      <Text style={styles.item}>Printer</Text>
      <Text style={styles.item}>Tentang Kami</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  item: {
    fontSize: 18,
    marginVertical: 10,
    color: '#000', // Make sure the TouchableOpacity text looks the same
  },
})
