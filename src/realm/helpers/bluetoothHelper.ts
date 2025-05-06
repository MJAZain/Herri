import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export type BluetoothDevice = {
  id: string;
  name: string | null;
};

const bleManager = new BleManager();

const requestPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
  }
  return true;
};

export const checkBluetoothEnabled = async () => {
  const state = await bleManager.state();
  return state === 'PoweredOn';
};

export const listPairedDevices = async (): Promise<BluetoothDevice[]> => {
  const permissionGranted = await requestPermissions();
  if (!permissionGranted) {
    Alert.alert('Permission denied');
    return [];
  }

  return new Promise((resolve) => {
    const devices: BluetoothDevice[] = [];
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error', error);
        resolve([]);
        return;
      }
      if (device && !devices.find(d => d.id === device.id)) {
        devices.push({ id: device.id, name: device.name });
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      resolve(devices);
    }, 5000);
  });
};

let connectedDevice: any = null;

export const connectToPrinter = async (deviceId: string) => {
  try {
    connectedDevice = await bleManager.connectToDevice(deviceId);
    await connectedDevice.discoverAllServicesAndCharacteristics();
    console.log('Connected to device:', deviceId);
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    return false;
  }
};

export const disconnectPrinter = async () => {
  try {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
      console.log('Disconnected');
      connectedDevice = null;
    }
    return true;
  } catch (error) {
    console.error('Disconnect error', error);
    return false;
  }
};

// You need to know the serviceUUID and characteristicUUID your printer uses
const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

export const printReceipt = async (receipt: string): Promise<boolean> => {
  try {
    const connectedDevice = await bleManager.connectedDevices([SERVICE_UUID]);
    if (!connectedDevice.length) {
      Alert.alert('No printer connected');
      return false;
    }

    const printer = connectedDevice[0];
    const encoded = Buffer.from(receipt, 'utf-8').toString('base64');

    await printer.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      encoded
    );

    console.log('Receipt sent to printer');
    return true;
  } catch (error) {
    console.error('Failed to print receipt:', error);
    return false;
  }
};