import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet
} from 'react-native';
import { BSON } from 'realm';
import { getAllExpenseTypes, addExpense } from '../../realm/helpers/expenseTypeHelper';
import Toast from '../../components/toast';

type ExpenseType = {
  _id: BSON.ObjectId;
  name: string;
};

const AddExpenseScreen = () => {
  const [amount, setAmount] = useState('');
  const [expenseTypes, setExpenseTypes] = useState<{ _id: BSON.ObjectId; name: string }[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<BSON.ObjectId | null>(null);

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
    const showToast = (message: string, type: 'success' | 'error') => {
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    };

  useEffect(() => {
    const results = getAllExpenseTypes();
  
    const formatted = results.map((type) => ({
      _id: (type as any)._id,
      name: (type as any).name,
    }));
  
    setExpenseTypes(formatted);
  
    results.addListener((collection) => {
      const updated = collection.map((type) => ({
        _id: (type as any)._id,
        name: (type as any).name,
      }));
      setExpenseTypes(updated);
    });
  
    return () => results.removeAllListeners();
  }, []);
  
  
  const isFormValid =
    amount.trim() !== '' &&
    selectedTypeId !== null;

  const handleAddExpense = () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount)) {
      showToast('Data Pengeluaran harus Numerik.', 'error');
      return;
    }

    const selectedType = expenseTypes.find((type) => type._id.equals(selectedTypeId!));
    if (!selectedType) {
      showToast('Data Pengeluaran Tidak Valid.', 'error');
      return;
    }

    addExpense(parsedAmount, new Date(), selectedType);
    setAmount('');
    setSelectedTypeId(null);
    showToast('Pengeluaran Berhasil Ditambah.', 'success');
  };

  const renderTypeItem = ({ item }: { item: { _id: BSON.ObjectId; name: string } }) => (
    <View style={styles.list}>
      <TouchableOpacity
      style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: selectedTypeId?.equals(item._id) ? 'rgba(44, 87, 140, 1)' : '#e0e0e0',
        borderBottomWidth: 2,
        borderColor: '#eee',
      }}
      onPress={() => setSelectedTypeId(item._id)}
    >
      <Text style={{ color: selectedTypeId?.equals(item._id) ? '#fff' : '#000' }}>{item.name}</Text>
    </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Pengeluaran</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
        style={styles.input}
        placeholder="Jumlah"
        placeholderTextColor='rgba(44, 87, 140, 0.5)'
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pilih Jenis Pengeluaran</Text>
      </View>
      <FlatList
        data={expenseTypes}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={renderTypeItem}
        ListEmptyComponent={<Text>Belum ada Jenis Pengeluaran.</Text>}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isFormValid ? 'rgba(255, 219, 137, 1)' : '#ccc' },
        ]}
        onPress={handleAddExpense}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Tambah Pengeluaran</Text>
      </TouchableOpacity>
      </View>
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
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  list: {
    padding: 9,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'rgba(44, 87, 140, 1)',
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
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
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(44, 87, 140, 1)',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Bold'
  },
})

export default AddExpenseScreen;
