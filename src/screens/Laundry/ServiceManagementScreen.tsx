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
import { getAllServices, addService, deleteService } from '../../realm/helpers/serviceHelpers';

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

    // Reset fields
    setName('');
    setDescription('');
    setPricePerKg('');
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={styles.serviceRow}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.description}</Text>
      <Text style={styles.cell}>{formatCurrency(item.pricePerKg)}/kg</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteService(item._id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Service</Text>

      <TextInput
        style={styles.input}
        placeholder="Service Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Price per Kg"
        value={pricePerKg}
        onChangeText={setPricePerKg}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: isFormComplete ? '#4dabf7' : '#ccc' },
        ]}
        onPress={handleAdd}
        disabled={!isFormComplete}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>Accepted Services</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={renderServiceItem}
        ListEmptyComponent={<Text>No services added yet.</Text>}
      />
    </View>
  );
};

export default ServiceManagementScreen;

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'center',
    marginLeft: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  },
});
