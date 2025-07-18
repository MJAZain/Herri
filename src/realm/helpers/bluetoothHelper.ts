import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONNECTED_DEVICE_KEY = 'CONNECTED_PRINTER_ID';
const PAPER_WIDTH_KEY = 'PRINTER_PAPER_WIDTH';
let connectedDevice: BluetoothDevice | null = null;

if (__DEV__) {
  (global as any).connectedPrinter = connectedDevice;
}

export const saveConnectedDeviceId = async (deviceId: string) => {
  await AsyncStorage.setItem(CONNECTED_DEVICE_KEY, deviceId);
};

export const getSavedConnectedDeviceId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(CONNECTED_DEVICE_KEY);
};

export const clearConnectedDeviceId = async () => {
  await AsyncStorage.removeItem(CONNECTED_DEVICE_KEY);
};

export const savePaperWidth = async (width: '58' | '76' | '80') => {
  try {
    await AsyncStorage.setItem('PAPER_WIDTH', width);
  } catch (err) {
    console.error('Failed to save paper width:', err);
  }
};

export const getSavedPaperWidth = async (): Promise<'58' | '76' | '80' | null> => {
  try {
    const value = await AsyncStorage.getItem('PAPER_WIDTH');
    if (value === '58' || value === '76' || value === '80') {
      return value;
    }
    return null;
  } catch (err) {
    console.error('Failed to load paper width:', err);
    return null;
  }
};

export const clearPaperWidth = async () => {
  await AsyncStorage.removeItem(PAPER_WIDTH_KEY);
};

export const connectToPrinter = async (deviceId: string): Promise<BluetoothDevice | null> => {
  try {
    const devices = await RNBluetoothClassic.getBondedDevices();
    const device = devices.find(d => d.id === deviceId);
    if (!device) throw new Error('Device not found');

    const connected = await RNBluetoothClassic.connectToDevice(device.id);
    if (connected) {
      connectedDevice = device;
      console.log('✅ Connected to printer:', deviceId);
      return device;
    } else {
      throw new Error('Connection failed');
    }
  } catch (error) {
    console.error('❌ Connection error:', error);
    return null;
  }
};

export const disconnectPrinter = async (): Promise<boolean> => {
  if (!connectedDevice) {
    console.log('ℹ️ No device to disconnect');
    return true;
  }

  try {
    await connectedDevice.disconnect();
    
    console.log('🔌 Disconnected from printer:', connectedDevice.name);

    connectedDevice = null;
    await clearConnectedDeviceId();
    
    return true;
  } catch (error: unknown) {
    console.error('❌ Disconnect error:', error);
    
    if (error instanceof Error) {
      console.error('Disconnect failed:', error.message);
    }
    
    return false;
  }
};

export const getConnectedDevice = () => connectedDevice;

const requestPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ]);
    return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
  }
  return true;
};

export const checkBluetoothEnabled = async () => {
  return await RNBluetoothClassic.isBluetoothEnabled();
};

export const listPairedDevices = async (): Promise<BluetoothDevice[]> => {
  const permissionGranted = await requestPermissions();
  if (!permissionGranted) {
    Alert.alert('Permission denied');
    return [];
  }

  try {
    const devices = await RNBluetoothClassic.getBondedDevices();
    return devices;
  } catch (error) {
    console.error('🔍 Failed to list paired devices:', error);
    return [];
  }
};

export const reconnectIfNeeded = async (): Promise<BluetoothDevice | null> => {
  const savedId = await getSavedConnectedDeviceId();
  if (!savedId) return null;

  return await connectToPrinter(savedId);
};

export const isDeviceStillConnected = async (): Promise<boolean> => {
  try {
    const connectedDevices: BluetoothDevice[] = await RNBluetoothClassic.getConnectedDevices();
    return connectedDevices.length > 0;
  } catch (error: unknown) {
    console.error('Failed to check connection state:', error);
    
    if (error instanceof Error) {
      console.error(error.message);
    }
    
    return false;
  }
};

export const printReceipt = async (receipt: string): Promise<boolean> => {
  try {
    const connected = await isDeviceStillConnected();
    if (!connected || !connectedDevice) {
      Alert.alert('No printer connected');
      console.warn('⚠️ No classic Bluetooth printer connected');
      return false;
    }

    const lineFeed = '\n\n\n';
    const finalReceipt = receipt + lineFeed;

    console.log('📤 Sending receipt to printer...');
    await connectedDevice.write(finalReceipt);

    console.log('✅ Receipt sent to printer successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to print receipt:', error);
    return false;
  }
};

export const formatReceipt = (transaction: any, paperWidth: '58' | '76' | '80' = '80'): string => {
  if (!transaction) return '';

  const { customer, services, totalWeight, totalPrice, createdAt, status } = transaction;

  const lineWidths: Record<typeof paperWidth, number> = {
    '58': 32,
    '76': 40,
    '80': 42,
  };

  const lineWidth = lineWidths[paperWidth];
  const line = '-'.repeat(lineWidth);

  const center = (text: string) => {
    const space = Math.floor((lineWidth - text.length) / 2);
    return ' '.repeat(space) + text;
  };

  const right = (text: string) => {
    return text.padStart(lineWidth);
  };

  const formatServiceLine = (
    name: string,
    weight: number,
    pricePerKg: number,
    totalPrice: number
  ) => {
    const left = `${name} ${weight}kg @${pricePerKg}/kg`;
    const rightPrice = `Rp${totalPrice.toLocaleString()}`;
    if (left.length + rightPrice.length > lineWidth) {
      return `${left}\n${right(rightPrice)}`;
    } else {
      const space = lineWidth - left.length - rightPrice.length;
      return `${left}${' '.repeat(space)}${rightPrice}`;
    }
  };

  const receipt =
`${line}
${center('RECEIPT PESANAN')}
${line}
Nama     : ${customer.name}
No. Hp   : ${customer.phoneNumber}
Alamat   : ${customer.address}

Tanggal  : ${new Date(createdAt).toLocaleString()}
Status   : ${status}
${line}
LAYANAN
${line}
${services
  .map(
    (service: any) =>
      formatServiceLine(service.name, service.weight, service.pricePerKg, service.totalPrice)
  )
  .join('\n')}
${line}
Total Berat : ${totalWeight} kg
Total Harga : Rp${totalPrice.toLocaleString()}
${line}
${center('TERIMA KASIH')}
${line}
\n\n\n`;

  return receipt;
};

