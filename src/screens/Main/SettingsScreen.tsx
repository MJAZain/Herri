import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../App'

import AboutIcon from '../../../assets/icons/settingsicon/AboutIcon.svg'
import PelangganIcon from '../../../assets/icons/settingsicon/PelangganIcon.svg'
import ExpenseIcon from '../../../assets/icons/settingsicon/ExpenseIcon.svg'
import PrinterIcon from '../../../assets/icons/settingsicon/PrinterIcon.svg'
import ProfileIcon from '../../../assets/icons/settingsicon/ProfileIcon.svg'
import ServiceIcon from '../../../assets/icons/settingsicon/ServiceIcon.svg'
import SettingBG from '../../../assets/icons/settingsicon/SettingBG.svg'

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      
      {/* Background SVG */}
      <View style={[StyleSheet.absoluteFill, { top: 400 }]} pointerEvents="none">
        <SettingBG width="100%" height="150%" />
      </View>

      <View style={styles.setting}>
        <Text style={styles.title}>Pengaturan</Text>

        <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('UserManagement')}>
          <ProfileIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.item}>Profile</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('ServiceManagement')}>
          <ServiceIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.item}>Layanan</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('ExpenseManagement')}>
          <ExpenseIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.item}>Pengeluaran</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('CustomerManagement')}>
          <PelangganIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.item}>Pelanggan</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('PrinterSetting')}>
          <PrinterIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.item}>Printer</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.itemRow} onPress={() => setModalVisible(true)}>
          <AboutIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.item}>Tentang Kami</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>

      
      <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Herri Laundry</Text>
          <Text style={styles.modalText}>
            Aplikasi ini bertujuan untuk memberikan pelayanan maksimum
            dalam memanajemen usaha laundry anda!
          </Text>
          <Text style={styles.modalVersion}>v1.0.0</Text>

          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(251, 247, 238, 1)',
    justifyContent: 'center',
  },
  setting: {
    backgroundColor: 'rgba(242, 250, 254, 1)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 5.6,
    elevation: 5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(44, 87, 140, 0.3)',
    marginVertical: -4,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'rgba(44, 87, 140, 1)'
  },
  item: {
    fontSize: 18,
    marginVertical: 10,
    color: 'rgba(44, 87, 140, 1)',
  },
  modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Lexend-Light'
  },
  modalVersion: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
