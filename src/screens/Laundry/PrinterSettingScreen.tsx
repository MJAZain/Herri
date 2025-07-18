import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import {
  listPairedDevices,
  connectToPrinter,
  disconnectPrinter,
  isDeviceStillConnected,
  getConnectedDevice,
  getSavedPaperWidth, 
  savePaperWidth
} from '../../realm/helpers/bluetoothHelper';
import Toast from '../../components/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BluetoothDevice = {
  id: string;
  name: string | null;
  address: string;
};

const PrinterSettingsScreen: React.FC = () => {
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [connectedPrinter, setConnectedPrinter] = useState<BluetoothDevice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paperWidth, setPaperWidth] = useState<'58' | '76' | '80'>('80');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // 👇 move this OUTSIDE useEffect so it can be called anywhere
const checkConnectionAndFetch = async () => {
  const device = getConnectedDevice();
  if (device) {
    const stillConnected = await isDeviceStillConnected();
    console.log(`[DEBUG] Physical connection state: ${stillConnected}`);

    if (stillConnected) {
      setConnectedPrinter(device);
      console.log('[DEBUG] Skipping scan — printer still connected');
      return;
    }
  }

  const savedWidth = await getSavedPaperWidth();
  if (savedWidth) {
    setPaperWidth(savedWidth);
  }

  setConnectedPrinter(null);
  fetchDevices();
};

  const handleConnect = async (deviceId: string) => {
    console.log(`[DEBUG] Attempting to connect to device: ${deviceId}`);
    const device = await connectToPrinter(deviceId);
    if (device) {
      console.log(`[DEBUG] Successfully connected to: ${deviceId}`);
      setConnectedPrinter(device);
      showToast('Printer connected!', 'success');
    } else {
      showToast('Failed to connect to printer.', 'error');
    }
  };

const handleDisconnect = async () => {
  console.log('[DEBUG] Attempting to disconnect printer');
  try {
    const success = await disconnectPrinter();
    if (success) {
      console.log('[DEBUG] Successfully disconnected printer');
      setConnectedPrinter(null);
      showToast('Printer disconnected!', 'success');

      checkConnectionAndFetch();

    } else {
      showToast('Failed to disconnect printer.', 'error');
    }
  } catch (error) {
    console.error('[ERROR] Error while disconnecting printer:', error);
    showToast('An unexpected error occurred while disconnecting.', 'error');
  }
};

  const fetchDevices = async () => {
    try {
      setLoading(true);
      console.log('[DEBUG] Fetching paired devices...');
      const devices = await listPairedDevices();
      setPairedDevices(devices);
    } catch (error) {
      console.error('[ERROR] Failed to fetch paired devices:', error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const debug = async () => {
    const value = await AsyncStorage.getItem('PAPER_WIDTH');
    console.log('Stored PAPER_WIDTH:', value);
  };

  debug();

  checkConnectionAndFetch();

}, []);


  const renderPaperWidthOptions = () => {
  const options = [
    { label: '57/58 mm', value: '58' },
    { label: '76 mm', value: '76' },
    { label: '80/82.5 mm', value: '80' },
  ];

  return (
    <View style={styles.paperWidthContainer}>
      <Text style={styles.text}>Select paper width:</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionButton,
              paperWidth === opt.value && styles.optionButtonSelected,
            ]}
              onPress={() => {
                const newWidth = opt.value as typeof paperWidth;
                setPaperWidth(newWidth);
                savePaperWidth(newWidth).then(() => {
                  showToast(`Paper width set to ${opt.label}`, 'success');
                }).catch((err) => {
                  console.error(err);
                  showToast(`Failed to save paper width`, 'error');
                });
              }}
          >
            <Text
              style={[
                styles.optionText,
                paperWidth === opt.value && styles.optionTextSelected,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>

        ))}
      </View>
    </View>
  );
};

  const renderDeviceItem = ({ item }: { item: BluetoothDevice }) => (
    <View style={styles.deviceItem}>
      <Text style={styles.deviceText}>{item.name || 'Unnamed Device'}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleConnect(item.id)}>
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atur Printer</Text>
      </View>

      {connectedPrinter ? (
        <View style={styles.containerPrinter}>
          <Text style={styles.text}>
            Currently connected to: {connectedPrinter.name ?? connectedPrinter.id}
          </Text>
          {renderPaperWidthOptions()}
          <TouchableOpacity style={styles.button} onPress={handleDisconnect}>
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#4dabf7" />
      ) : (
        <FlatList
          data={pairedDevices}
          keyExtractor={(item) => item.id}
          renderItem={renderDeviceItem}
          ListEmptyComponent={
            <Text style={styles.containerPrinter}>No Bluetooth devices found.</Text>
          }
        />
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    paperWidthContainer: {
  marginVertical: 16,
},
optionsRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 8,
},
optionButton: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#ccc',
  backgroundColor: '#fff',
},
optionButtonSelected: {
  backgroundColor: '#4dabf7',
  borderColor: '#4dabf7',
},
optionText: {
  color: '#333',
},
optionTextSelected: {
  color: '#fff',
  fontFamily: 'Lexend-Bold'
},
  text: { fontFamily: 'Lexend-Bold' },
  container: { flex: 1 },
  containerPrinter: {
    padding: 16,
    margin: 16,
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
  button: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    fontFamily: 'Lexend-Bold',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Lexend-Bold',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  deviceText: { fontFamily: 'Lexend-Regular'},
});

export default PrinterSettingsScreen;
