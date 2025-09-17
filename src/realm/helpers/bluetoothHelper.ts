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

interface IUser {
  _id: Realm.BSON.ObjectId;
  name: string;
  shopName: string;
  shopAddress: string;
  profilePicture?: string;
}

function wrapField(label: string, value: string, maxLineLength: number): string {
  const labelPart = `${label}: `;
  const indent = ' '.repeat(labelPart.length);

  if (!value.trim()) return labelPart;

  const words = value.split(/\s+/);
  let lines: string[] = [];
  let currentLine = labelPart;

  for (const word of words) {
    const prefix = lines.length > 0 ? indent : "";
    const testLine = (lines.length > 0 ? currentLine + " " + word : currentLine + word);

    if (prefix.length + testLine.length <= maxLineLength) {
      currentLine = lines.length > 0
        ? currentLine + " " + word
        : currentLine + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push((lines.length > 0 ? indent : "") + currentLine);
  }

  return lines.join("\n");
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
      if (typeof firstUser.name === 'string') shopInfo.name = firstUser.name;
      if (typeof firstUser.shopAddress === 'string') shopInfo.address = firstUser.shopAddress;
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
    if (text.length >= lineWidth) return text;
    const totalPadding = lineWidth - text.length;
    const left = Math.floor(totalPadding / 2);
    const right = totalPadding - left;
    return ' '.repeat(left) + text + ' '.repeat(right);
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
    const leftPart = `${name} ${weight}kg @${pricePerKg}/kg`;
    const rightPart = `Rp${totalPrice.toLocaleString()}`;

    if (leftPart.length + rightPart.length > lineWidth) {
      const wrappedLeft = wrapField('', leftPart, lineWidth - rightPart.length - 1);
      const lines = wrappedLeft.split('\n');
      return [
        lines[0] + ' '.repeat(lineWidth - lines[0].length - rightPart.length) + rightPart,
        ...lines.slice(1)
      ].join('\n');
    }

    return `${leftPart}${' '.repeat(lineWidth - leftPart.length - rightPart.length)}${rightPart}`;
  };

  const initializePrinter = '\x1B\x40';
  const setSmallFont = '\x1B\x4D\x01';
  const doubleHeight = '\x1B\x21\x10';
  const resetPrinter = '\x1B\x21\x00';

  const STRINGS = {
    receiptTitle: 'RECEIPT PESANAN',
    thanks: 'TERIMA KASIH',
    layanan: 'LAYANAN',
    nama: 'Nama',
    alamat: 'Alamat',
    phone: 'No. Hp',
    tanggal: 'Tanggal',
    status: 'Status',
    totalBerat: 'Total Berat',
    totalHarga: 'Total Harga'
  };

  const receipt =
`${initializePrinter}${setSmallFont}${doubleHeight}
${line}
${center(shopInfo.name)}
${shopInfo.address ? center(shopInfo.address) + '\n' : ''}${line}
${center(STRINGS.receiptTitle)}
${line}
${wrapField(STRINGS.nama, customer.name, lineWidth)}
${wrapField(STRINGS.alamat, customer.address, lineWidth)}
${wrapField(STRINGS.phone, customer.phoneNumber, lineWidth)}
${wrapField(STRINGS.tanggal, new Date(createdAt).toLocaleDateString('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}), lineWidth)}
${wrapField(STRINGS.status, status, lineWidth)}
${line}
${center(STRINGS.layanan)}
${line}
${services.map(
  (service: any) =>
    formatServiceLine(service.name, service.weight, service.pricePerKg, service.totalPrice)
).join('\n')}
${line}
${wrapField(STRINGS.totalBerat, `${totalWeight} kg`, lineWidth)}
${wrapField(STRINGS.totalHarga, `Rp${totalPrice.toLocaleString()}`, lineWidth)}
${line}
${center(STRINGS.thanks)}
${line}
${resetPrinter}
\n\n\n`;

  return receipt;
};
