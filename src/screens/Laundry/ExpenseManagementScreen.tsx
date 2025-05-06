import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { BSON } from 'realm';
import { useExpenses } from '../../realm/helpers/exspenseHelper';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const ExpenseManagementScreen = () => {
  const { expenses, deleteExpense, updateExpense } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState<BSON.ObjectId | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState('');

  const filteredExpenses = expenses.filter(exp =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: BSON.ObjectId) => {
    Alert.alert('Konfirmasi', 'Hapus pengeluaran ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => deleteExpense(id),
      },
    ]);
  };

  const startEditing = (expense: any) => {
    setEditingExpenseId(expense._id);
    setEditedTitle(expense.title);
    setEditedAmount(expense.amount.toString());
  };

  const handleUpdate = () => {
    if (!editedTitle.trim() || !editedAmount.trim()) return;

    updateExpense(editingExpenseId!, {
      title: editedTitle.trim(),
      amount: parseFloat(editedAmount),
    });

    setEditingExpenseId(null);
    setEditedTitle('');
    setEditedAmount('');
  };

  const renderItem = ({ item }: any) => {
    const isEditing = item._id.equals(editingExpenseId!);
    return (
      <View style={styles.itemRow}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.inputInline}
              value={editedTitle}
              onChangeText={setEditedTitle}
            />
            <TextInput
              style={styles.inputInline}
              value={editedAmount}
              onChangeText={setEditedAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={handleUpdate}>
              <Text style={styles.updateButton}>✔</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub}>{formatCurrency(item.amount)}</Text>
            </View>
            <TouchableOpacity onPress={() => startEditing(item)}>
              <Text style={styles.editButton}>Ubah</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteButton}>Hapus</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manajemen Pengeluaran</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Cari berdasarkan jenis pengeluaran..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredExpenses}
        keyExtractor={item => item._id.toHexString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada pengeluaran.</Text>}
      />
    </View>
  );
};

export default ExpenseManagementScreen;

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  searchBar: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemSub: { color: '#555', fontSize: 14 },
  editButton: {
    marginHorizontal: 10,
    color: '#4dabf7',
    fontWeight: '600',
  },
  deleteButton: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  updateButton: {
    color: '#2ecc71',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  inputInline: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});
