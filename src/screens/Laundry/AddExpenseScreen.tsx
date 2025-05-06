import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { addExpense } from '../../realm/helpers/exspenseHelper';

const AddExpenseScreen = () => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const isFormValid = title.trim() !== '' && amount.trim() !== '';

  const handleAddExpense = () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount)) {
      Alert.alert('Invalid Input', 'Amount must be a number');
      return;
    }

    addExpense(title.trim(), parsedAmount, new Date());
    setTitle('');
    setAmount('');
    Alert.alert('Success', 'Expense added!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add an Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Expense Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isFormValid ? '#4dabf7' : '#ccc' },
        ]}
        onPress={handleAddExpense}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
