import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { listPairedDevices, connectToPrinter, disconnectPrinter } from '../../realm/helpers/bluetoothHelper';

type BluetoothDevice = {
  id: string;
  name: string | null;
};

const PrinterSettingsScreen: React.FC = () => {
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [connectedPrinter, setConnectedPrinter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      const devices = await listPairedDevices();
      setPairedDevices(devices);
      setLoading(false);
    };

    fetchDevices();
  }, []);

  const handleConnect = async (deviceId: string) => {
    const success = await connectToPrinter(deviceId);
    if (success) {
      setConnectedPrinter(deviceId);
      Alert.alert('Success', 'Printer connected!');
    } else {
      Alert.alert('Failed', 'Failed to connect to printer.');
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectPrinter();
    if (success) {
      setConnectedPrinter(null);
      Alert.alert('Success', 'Printer disconnected!');
    } else {
      Alert.alert('Failed', 'Failed to disconnect from printer.');
    }
  };

  const renderDeviceItem = ({ item }: { item: BluetoothDevice }) => (
    <View style={styles.deviceItem}>
      <Text>{item.name || 'Unnamed Device'}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleConnect(item.id)}>
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Printer Settings</Text>

      {connectedPrinter ? (
        <View>
          <Text>Currently connected to: {connectedPrinter}</Text>
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
          ListEmptyComponent={<Text>No BLE devices found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  button: {
    backgroundColor: '#4dabf7',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default PrinterSettingsScreen;