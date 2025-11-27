import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRealm } from '..';

const CONNECTED_DEVICE_KEY = 'CONNECTED_PRINTER_ID';
const PAPER_WIDTH_KEY = 'PAPER_WIDTH_KEY';
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
    await AsyncStorage.setItem('PAPER_WIDTH_KEY', width);
  } catch (err) {
    console.error('Failed to save paper width:', err);
  }
};

export const getSavedPaperWidth = async (): Promise<'58' | '76' | '80' | null> => {
  try {
    const value = await AsyncStorage.getItem('PAPER_WIDTH_KEY');
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
  await AsyncStorage.removeItem('PAPER_WIDTH_KEY');
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

export const printReceipt = async (transaction: any): Promise<boolean> => {
  try {
    // Check if we have a connected device
    if (!connectedDevice) {
      console.warn('⚠️ No printer device object available');
      return false;
    }

    // Verify the device is actually connected
    const connected = await isDeviceStillConnected();
    if (!connected) {
      console.warn('⚠️ Printer is not connected');
      connectedDevice = null;
      await clearConnectedDeviceId();
      return false;
    }

    // Get paper width with fallback
    const savedWidth = await getSavedPaperWidth();
    const paperWidth: '58' | '76' | '80' = savedWidth || '80';

    // Format receipt
    const receipt = formatReceipt(transaction, paperWidth);
    const finalReceipt = receipt + '\n\n\n';

    console.log(`📤 Sending receipt (${paperWidth}mm, ${finalReceipt.length} chars) to printer...`);
    
    // Send to printer
    await connectedDevice.write(finalReceipt);

    console.log('✅ Receipt sent to printer successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to print receipt:', error);
    
    // If there's a write error, the connection might be bad
    connectedDevice = null;
    await clearConnectedDeviceId();
    
    return false;
  }
};

interface IUser {
  _id: Realm.BSON.ObjectId;
  name: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  profilePicture?: string;
}

function wrapField(
  label: string,
  value: string,
  maxLineLength: number,
  labelWidth: number = 9
): string {
  try {
    const paddedLabel = label.padEnd(labelWidth, ' ');
    const labelPart = `${paddedLabel}: `;
    const indent = ' '.repeat(labelPart.length);

    if (!value || !value.trim()) return labelPart;

    // Combine label and wrapped value with hanging indentation
    const wrappedValue = wrapTextWithIndent(value, maxLineLength, labelPart.length);

    // Combine label with the first line of wrapped text
    const lines = wrappedValue.split('\n');
    const firstLine = labelPart + lines[0];
    const subsequentLines = lines.slice(1).map(line => indent + line);

    return [firstLine, ...subsequentLines].join('\n');
  } catch (error) {
    console.error('Error in wrapField:', error);
    return `${label.padEnd(labelWidth, ' ')}: ${value}`; // Fallback
  }
}

function wrapTextWithIndent(text: string, maxLineLength: number, indentSize: number): string {
  try {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return '';

    let lines: string[] = [];
    let currentLine = '';

    const indent = ' '.repeat(indentSize);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const lineLength = lines.length === 0 ? maxLineLength - indentSize : maxLineLength - indentSize;
      const testLine = currentLine ? currentLine + ' ' + word : word;

      if (testLine.length <= lineLength) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
  } catch (error) {
    console.error('Error in wrapTextWithIndent:', error);
    return text;
  }
}

function wrapText(text: string, maxWidth: number): string {
  if (!text) return "";

  const words = text.split(" ");
  let line = "";
  let result = "";

  for (const word of words) {
    // If the word itself is longer than maxWidth, break it into chunks
    if (word.length > maxWidth) {
      // If there's content in the current line, add it to result first
      if (line.length > 0) {
        result += line.trimEnd() + "\n";
        line = "";
      }
      
      // Break the long word into chunks that fit within maxWidth
      let remainingWord = word;
      while (remainingWord.length > 0) {
        if (remainingWord.length <= maxWidth) {
          result += remainingWord + "\n";
          remainingWord = "";
        } else {
          // Find the maximum chunk that fits
          let chunk = remainingWord.substring(0, maxWidth);
          result += chunk + "\n";
          remainingWord = remainingWord.substring(maxWidth);
        }
      }
    } 
    // Normal word wrapping logic
    else if ((line + word).length > maxWidth) {
      result += line.trimEnd() + "\n";
      line = word + " ";
    } else {
      line += word + " ";
    }
  }

  if (line.length > 0) {
    result += line.trimEnd();
  }

  return result;
}

export const formatReceipt = (
  transaction: any,
  paperWidth: '58' | '76' | '80'
): string => {
  if (!transaction) return '';

  let shopInfo: { name: string; address?: string; phone?: string } = { name: 'My Shop' };

  try {
    const realm = getRealm();
    const users = realm.objects<IUser>('User');
    if (users.length > 0) {
      const firstUser = users[0];
      if (typeof firstUser.shopName === 'string') shopInfo.name = firstUser.shopName;
      if (typeof firstUser.shopAddress === 'string') shopInfo.address = firstUser.shopAddress;
      if (typeof firstUser.shopPhone === 'string') shopInfo.phone = firstUser.shopPhone;
    }
  } catch (error) {
    console.error('Error fetching shop info:', error);
  }

  const customer = transaction.customer || {};
  const services = transaction.services || [];
  const totalWeight = transaction.totalWeight || 0;
  const totalPrice = transaction.totalPrice || 0;
  const createdAt = transaction.createdAt || null;

  const lineWidths: Record<typeof paperWidth, number> = {
    '58': 42,
    '76': 56,
    '80': 60
  };

  const lineWidth = lineWidths[paperWidth];
  const line = '='.repeat(lineWidth);
  const right = (text: string) => text.padStart(lineWidth);

  const formatServiceLine = (
  name: string,
  weight: number,
  pricePerKg: number,
  totalPrice: number
) => {
  const serviceLine = `${name} ${weight}kg @${pricePerKg}/kg`;
  const priceLine = `Rp${totalPrice.toLocaleString()}`;
  
  return `${serviceLine}\n${priceLine}\n`;
};

  const ESC = {
    init: '\x1B\x40',
    fontA: '\x1B\x4D\x00',
    fontB: '\x1B\x4D\x01',
    doubleHeight: '\x1B\x21\x10',
    reset: '\x1B\x21\x00',
    alignLeft: '\x1B\x61\x00',
    alignCenter: '\x1B\x61\x01',
    alignRight: '\x1B\x61\x02',
  };

  const STRINGS = {
    receiptTitle: 'RECEIPT PESANAN',
    thanks: 'TERIMA KASIH',
    layanan: 'LAYANAN',
    nama: 'Nama',
    alamat: 'Alamat Pelanggan',
    phone: 'No. Hp',
    tanggal: 'Tanggal',
    status: 'Status',
    totalBerat: 'Total Berat',
    totalHarga: 'Total Harga'
  };

  const receipt =
`${ESC.init}${ESC.fontA}
${ESC.fontB}${ESC.alignCenter}${line}
${ESC.fontA}${shopInfo.name}\n` +
  (shopInfo.phone ? `${ESC.alignCenter}${shopInfo.phone}\n` : '') +
  (shopInfo.address ? `${ESC.alignCenter}${shopInfo.address}\n` : '') +
`${ESC.fontB}${line}
${ESC.fontA}${STRINGS.receiptTitle}
${ESC.fontB}${line}
${ESC.fontA}${ESC.alignLeft}${wrapField(STRINGS.nama, customer.name, lineWidth)}
${wrapField(STRINGS.phone, customer.phoneNumber, lineWidth)}
${wrapField(STRINGS.tanggal, new Date(createdAt).toLocaleDateString('en-GB'), lineWidth)}
${ESC.fontB}${ESC.alignCenter}${line}
${ESC.fontA}${ESC.alignCenter}${STRINGS.alamat}
${ESC.fontB}${ESC.alignCenter}${line}
${ESC.fontA}${ESC.alignLeft}${wrapText(customer.address, 42)}
${ESC.fontB}${ESC.alignCenter}${line}
${ESC.fontA}${STRINGS.layanan}
${ESC.fontB}${line}
${ESC.fontA}${ESC.alignLeft}${services.map(
  (service: any) =>
    formatServiceLine(service.name, service.weight, service.pricePerKg, service.totalPrice)
).join('\n')}
${ESC.fontB}${ESC.alignCenter}${line}
${ESC.fontA}${ESC.alignLeft}${wrapField(STRINGS.totalBerat, `${totalWeight} kg`, lineWidth)}
${wrapField(STRINGS.totalHarga, `Rp${totalPrice.toLocaleString()}`, lineWidth)}
${ESC.fontB}${ESC.alignCenter}${line}
${ESC.fontA}${STRINGS.thanks}
${ESC.fontB}${line}
${ESC.reset}
\n\n\n`;

  return receipt;
};
