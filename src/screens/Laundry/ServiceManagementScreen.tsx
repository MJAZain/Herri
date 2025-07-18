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
  getAllServices, 
  addService, 
  deleteService,
  updateService
 } from '../../realm/helpers/serviceHelpers';
import Toast from '../../components/toast';
import EditServiceModal from './EditServiceModal';


interface Service {
  _id: BSON.ObjectId;
  name: string;
  description: string;
  pricePerKg: number;
  icons: string[];
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const ServiceManagementScreen = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [editField, setEditField] = useState<'name' | 'description' | 'pricePerKg' | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleServiceEdit = (service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
  };


  const isFormComplete = name.trim() && description.trim() && pricePerKg.trim();

  useEffect(() => {
    const results = getAllServices();

    const plainServices = results.map((service) => ({
      _id: service._id as BSON.ObjectId,
      name: service.name as string,
      description: service.description as string,
      pricePerKg: service.pricePerKg as number,
      icons: service.icons as string[],
    }));

    setServices(plainServices);

    results.addListener((collection) => {
      const updatedServices = collection.map((service) => ({
        _id: service._id as BSON.ObjectId,
        name: service.name as string,
        description: service.description as string,
        pricePerKg: service.pricePerKg as number,
        icons: service.icons as string[],
      }));
      setServices(updatedServices);
    });

    return () => {
      results.removeAllListeners();
    };
  }, []);

  const handleAdd = () => {
    if (!isFormComplete) return;

    addService(name.trim(), parseFloat(pricePerKg), description.trim(), []);

    setName('');
    setDescription('');
    setPricePerKg('');
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
  <View style={styles.serviceRow}>

    <View style={styles.infoColumn}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.description}</Text>
      <Text style={styles.cell}>Rp. {item.pricePerKg}/kg</Text>
    </View>
    
    <View style={styles.actionColumn}>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => handleServiceEdit(item)}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteService(item._id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atur Layanan</Text>
      </View>

      <View style={styles.containerService}>
        <TextInput
          style={styles.input}
          placeholder="Nama Layanan"
          placeholderTextColor='rgba(44, 87, 140, 0.5)'
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Deskripsi"
          placeholderTextColor='rgba(44, 87, 140, 0.5)'
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Harga per Kg"
          placeholderTextColor='rgba(44, 87, 140, 0.5)'
          value={pricePerKg}
          onChangeText={setPricePerKg}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[
            styles.button,
            isFormComplete ? styles.buttonActive : null,
          ]}
          onPress={handleAdd}
          disabled={!isFormComplete}
        >
          <Text style={styles.addButtonText}>Tambah Layanan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Layanan</Text>
      </View>

      <View style={styles.containerServiceList}>
        <FlatList
          data={services}
          contentContainerStyle={{ paddingVertical: 6 }}
          keyExtractor={(item) => item._id.toHexString()}
          renderItem={renderServiceItem}
          ListEmptyComponent={<Text style={{ fontFamily: 'Lexend-Regular', textAlign: 'center' }}>Belum ada Layanan</Text>}
        />
      </View>

      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {selectedService && (
        <EditServiceModal
          visible={isModalVisible}
          initialData={{
            name: selectedService.name,
            description: selectedService.description,
            pricePerKg: selectedService.pricePerKg,
          }}
          onClose={() => setModalVisible(false)}
          onSave={(updates) => {
            try {
              updateService(selectedService._id, updates);
              showToast('Service berhasil diedit', 'success');
              setModalVisible(false);
            } catch (err) {
              showToast((err as Error).message, 'error');
            }
          }}
        />
      )}

    </View>
  );
};

export default ServiceManagementScreen;

const styles = StyleSheet.create({
  infoColumn: {
    flex: 1,
    marginRight: 12,
  },
  actionColumn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(240, 248, 252, 0.9)',
    padding: 16,
    margin: 2,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.51,
    shadowRadius: 4.3,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
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
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  containerService: {
    padding: 16,
    backgroundColor: 'rgba(44, 87, 140, 1)',
  },
  containerServiceList: {
    padding: 16,
    flex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'background: rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular'
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 5,
    fontFamily: 'Lexend-Regular'
  },
  editButtonText: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular',
    marginHorizontal: 6,
  },
  editButton: {
    color: '#007AFF',
    padding: 8,
    borderColor: 'rgba(44, 87, 140, 1)',
    borderWidth: 2,
    borderRadius: 8
  },
  button: {
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
});
