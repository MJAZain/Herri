import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRealm } from '..';

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

function wrapField(label: string, value: string, maxLineLength: number): string {
  const labelPart = `${label} : `;
  const indent = ' '.repeat(labelPart.length);
  
  // If empty value, just return the label
  if (!value.trim()) return labelPart;

  // If the entire value fits on one line with the label
  if (labelPart.length + value.length <= maxLineLength) {
    return labelPart + value;
  }

  const words = value.split(' ');
  let lines: string[] = [];
  let currentLine = labelPart; // Start with label for first line

  for (const word of words) {
    const availableWidth = lines.length > 0 ? maxLineLength - indent.length : maxLineLength;
    const testLine = lines.length > 0 
      ? indent + currentLine + ' ' + word 
      : currentLine + ' ' + word;

    if (testLine.length <= maxLineLength) {
      currentLine = lines.length > 0 
        ? currentLine + ' ' + word 
        : currentLine + (currentLine === labelPart ? '' : ' ') + word;
    } else {
      lines.push(currentLine);
      currentLine = indent + word;
    }
  }

  // Add the last line
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

interface IUser {
  _id: Realm.BSON.ObjectId;
  name: string;
  shopName: string;
  shopAddress: string;
  profilePicture?: string;
}

export const formatReceipt = (
  transaction: any,
  paperWidth: '58' | '76' | '80' = '80'
): string => {
  if (!transaction) return '';

  let shopInfo: { name: string; address?: string } = { name: 'My Shop' };
  try {
    const realm = getRealm();
    const users = realm.objects<IUser>('User');
    if (users.length > 0) {
      const firstUser = users[0];

      if (firstUser.name && typeof firstUser.name === 'string') {
        shopInfo.name = firstUser.name;
      } else {
        console.warn('shopName is missing or not a string in user object');
      }

      if (firstUser.shopAddress && typeof firstUser.shopAddress === 'string') {
        shopInfo.address = firstUser.shopAddress;
      } else {
        console.warn('shopAddress is missing or not a string in user object');
      }
    }
  } catch (error) {
    console.error('Error fetching shop info:', error);
  }

  const { customer, services, totalWeight, totalPrice, createdAt, status } = transaction;

  const lineWidths: Record<typeof paperWidth, number> = {
    '58': 42,
    '76': 56,
    '80': 60
  };

  const lineWidth = lineWidths[paperWidth];
  const line = '='.repeat(lineWidth);

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
    }
    return `${left}${' '.repeat(lineWidth - left.length - rightPrice.length)}${rightPrice}`;
  };

  const wrapField = (label: string, value: string, width: number): string => {
    return `${label}: ${value}`;
  };

  const initializePrinter = '\x1B\x40';
  const setSmallFont = '\x1B\x4D\x01';
  const resetPrinter = '\x1B\x4D\x00';

  const receipt =
`${initializePrinter}${setSmallFont}
${line}
${center(shopInfo.name)}
${shopInfo.address ? center(shopInfo.address) + '\n' : ''}
${line}
${center('RECEIPT PESANAN')}
${line}
${wrapField('Nama', customer.name, lineWidth)}
${wrapField('Alamat', customer.address, lineWidth)}
${wrapField('No. Hp', customer.phoneNumber, lineWidth)}
${wrapField('Tanggal', new Date(createdAt).toLocaleDateString('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}), lineWidth)}
${wrapField('Status', status, lineWidth)}
${line}
${center('LAYANAN')}
${line}
${services
  .map(
    (service: any) =>
      formatServiceLine(service.name, service.weight, service.pricePerKg, service.totalPrice)
  )
  .join('\n')}
${line}
${wrapField('Total Berat', `${totalWeight} kg`, lineWidth)}
${wrapField('Total Harga', `Rp${totalPrice.toLocaleString()}`, lineWidth)}
${line}
${center('TERIMA KASIH')}
${line}
${resetPrinter}
\n\n\n`;

  return receipt;
};
