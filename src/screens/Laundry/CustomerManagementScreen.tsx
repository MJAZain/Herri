import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { BSON } from 'realm';
import {
  addCustomer,
  BasicCustomer,
  deleteCustomer,
  getAllCustomers,
  updateCustomer,
} from '../../realm/helpers/customerHelper';
import Toast from '../../components/toast';
import { EditModal } from '../../components/EditModal';

const CustomerManagementScreen = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [customers, setCustomers] = useState<BasicCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<BasicCustomer | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const isFormComplete = name.trim() && phoneNumber.trim() && address.trim();

  useEffect(() => {
    const fetchedCustomers = getAllCustomers();
    setCustomers(fetchedCustomers);
  }, []);

  const handleAddCustomer = () => {
    if (!isFormComplete) return;

    const success = addCustomer(name.trim(), phoneNumber.trim(), address.trim());
    if (success) {
      showToast('Pelanggan Berhasil Ditambah!', 'success');
      setCustomers(getAllCustomers());
      setName('');
      setPhoneNumber('');
      setAddress('');
    } else {
      showToast('Data Pelanggan sudah ada.', 'error');
    }
  };

  const renderCustomerItem = ({ item }: { item: BasicCustomer }) => (
    <View style={styles.customerRow}>
      <View style={styles.infoColumn}>
        <Text style={styles.cell}>{item.name}</Text>
        <Text style={styles.cell}>{item.phoneNumber}</Text>
        <Text style={styles.cell}>{item.address}</Text>
      </View>
      
      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setSelectedCustomer(item);
            setEditModalVisible(true);
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            deleteCustomer(item._id);
            setCustomers(getAllCustomers());
            showToast('Customer deleted!', 'success');
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atur Pelanggan</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nama"
          value={name}
          placeholderTextColor='rgba(44, 87, 140, 0.5)'
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholderTextColor='rgba(44, 87, 140, 0.5)'
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor='rgba(44, 87, 140, 0.5)'
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity
          style={[styles.addButton, isFormComplete ? styles.buttonActive : null]}
          onPress={handleAddCustomer}
          disabled={!isFormComplete}
        >
          <Text style={styles.addButtonText}>Tambah Pelanggan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pelanggan</Text>
      </View>

      <View style={styles.list}>
        <FlatList
          data={customers}
          keyExtractor={(item) => item._id.toHexString()}
          renderItem={renderCustomerItem}
          ListEmptyComponent={<Text style={{ fontFamily: 'Lexend-Regular', textAlign: 'center' }}>Belum ada Pelanggan.</Text>}
        />
      </View>

      {selectedCustomer && (
        <EditModal
          visible={isEditModalVisible}
          title="Edit Customer"
          value={selectedCustomer.name}
          placeholder="Enter new name"
          onClose={() => setEditModalVisible(false)}
          onSave={(newName) => {
            const updated = updateCustomer(selectedCustomer.phoneNumber, {
              name: newName,
            });
            if (updated) {
              showToast('Customer updated!', 'success');
              setCustomers(getAllCustomers());
            } else {
              showToast('Update failed.', 'error');
            }
          }}
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
  infoColumn: {
    flex: 1,
    marginRight: 12,
  },
  actionColumn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'rgba(44, 87, 140, 1)',
    flex: 1
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
    fontFamily: 'Lexend-Bold'
  },
  list: {
    padding: 16,
    flex: 2
  },
  container: { 
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  input: {
    backgroundColor: '#fff',
    borderColor: 'rgba(44, 87, 140, 1)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 3,
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular'
  },
  addButton: {
    backgroundColor: 'rgba(110, 134, 170, 1)',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
  },
  addButtonText: {
    color: 'background: rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular'
  },
  customerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 5,
    borderColor: '#eee',
  },
  cell: { 
    flex: 1,
    fontSize: 14,
    paddingVertical: 5,
    fontFamily: 'Lexend-Regular',
  },
  editButton: { 
    color: '#007AFF',
    borderColor: 'rgba(44, 87, 140, 1)',
    borderWidth: 2,
    borderRadius: 8,
    padding: 8
  },
  editButtonText: { 
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular',
    marginHorizontal: 6, 
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  deleteButtonText: { 
    color: '#fff',
    fontFamily: 'Lexend-Regular' 
  },
});

export default CustomerManagementScreen;
