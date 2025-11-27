import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, } from 'react-native';
import { BSON } from 'realm';
import { 
  addExpenseType, 
  getAllExpenseTypes, 
  deleteExpenseType, 
  editExpenseType,
  ExpenseType 
} from '../../realm/helpers/expenseTypeHelper';
import { EditModal } from '../../components/EditModal';
import Toast from '../../components/toast';

const ExpenseTypeManagementScreen = () => {
  const [expenseTypes, setExpenseTypes] = useState<{ _id: BSON.ObjectId; name: string }[]>([]);
  const [expenseTypeName, setExpenseTypeName] = useState('');
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const isFormComplete = expenseTypeName.trim();

  useEffect(() => {
    const results = getAllExpenseTypes();

    const plainExpenseTypes = results.map((type) => ({
      _id: type._id as BSON.ObjectId,
      name: type.name as string,
    }));

    setExpenseTypes(plainExpenseTypes);

    results.addListener((collection) => {
      const updatedExpenseTypes = collection.map((type) => ({
        _id: type._id as BSON.ObjectId,
        name: type.name as string,
      }));
      setExpenseTypes(updatedExpenseTypes);
    });

    return () => {
      results.removeAllListeners();
    };
  }, []);

  const handleAddExpenseType = () => {
    if (!isFormComplete) return;

    addExpenseType(expenseTypeName.trim());

    setExpenseTypeName('');
  };

  const renderExpenseTypeItem = ({ item }: { item: ExpenseType }) => (
  <View style={styles.expenseTypeRow}>
    <Text style={styles.cell}>{item.name}</Text>

    <TouchableOpacity
      style={styles.editButton}
      onPress={() => {
        setSelectedExpenseType(item);
        setEditModalVisible(true);
      }}
    >
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteExpenseType(item._id)}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  </View>
);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atur Jenis Pengeluaran</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nama Pengeluaran (Maks 20 Karakter)"
          placeholderTextColor="rgba(44, 87, 140, 0.5)"
          maxLength={20}
          value={expenseTypeName}
          onChangeText={setExpenseTypeName}
        />

        <TouchableOpacity
        style={[
          styles.addButton,
          isFormComplete ? styles.buttonActive : null, ,
        ]}
        onPress={handleAddExpenseType}
        disabled={!isFormComplete}
      >
        <Text style={styles.addButtonText}>Tambah Jenis Pengeluaran</Text>
      </TouchableOpacity>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengeluaran</Text>
      </View>

      <View style={styles.expenseContainer}>
        <FlatList
          data={expenseTypes}
          keyExtractor={(item) => item._id.toHexString()}
          renderItem={renderExpenseTypeItem}
          ListEmptyComponent={<Text style={styles.list}>Belum ada jenis pengeluaran.</Text>}
        />
      </View>

      {selectedExpenseType && (
        <EditModal
          visible={isEditModalVisible}
          title="Edit Pengeluaran"
          value={selectedExpenseType.name}
          placeholder="Edit Nama Pengeluaran"
          onClose={() => setEditModalVisible(false)}
          onSave={(newName) => {
            try {
              editExpenseType(selectedExpenseType._id, newName);
              showToast('Pengeluaran Berhasil Diedit!', 'success');
            } catch (err) {
              showToast((err as Error).message, 'error');
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
  list: {
    fontFamily: 'Lexend-Regular', 
    textAlign: 'center',
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
  },
  expenseContainer: {
    padding: 16,
    flex: 4
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'rgba(44, 87, 140, 1)',
    flex: 1
  },
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
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Bold',
  },
  container: {
    flex: 1,
  },
  expenseTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Regular',
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
  addButtonText: {
    color: 'background: rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Bold'
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Regular',
  },
  editButtonText: {
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular',
    marginHorizontal: 6,
  },
  editButton: {
    color: '#007AFF',
    paddingVertical: 5,
    fontWeight: '600',
    marginHorizontal: 6,
    borderColor: 'rgba(44, 87, 140, 1)'
  },

});

export default ExpenseTypeManagementScreen;
