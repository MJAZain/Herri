import { getRealm } from '..';
import { BSON } from 'realm';

export type ExpenseType = {
  _id: BSON.ObjectId;
  name: string;
};

export const getAllExpenseTypes = (): Realm.Results<any> => {
  const realm = getRealm();
  return realm.objects('ExpenseType');
};

export const addExpenseType = (name: string): void => {
  const realm = getRealm();

  if (!name.trim()) {
    throw new Error('Expense type name cannot be empty.');
  }

  const existing = realm.objects('ExpenseType').filtered('name == $0', name.trim())[0];
  if (existing) {
    throw new Error('Expense type already exists.');
  }

  realm.write(() => {
    realm.create('ExpenseType', { _id: new BSON.ObjectId(), name: name.trim() });
  });
};

export const deleteExpenseType = (id: BSON.ObjectId): void => {
  const realm = getRealm();
  realm.write(() => {
    const expenseTypeToDelete = realm.objectForPrimaryKey('ExpenseType', id);
    if (expenseTypeToDelete) {
      realm.delete(expenseTypeToDelete);
    }
  });
};

export const editExpenseType = (id: BSON.ObjectId, newName: string): void => {
  const realm = getRealm();

  if (!newName.trim()) {
    throw new Error('Expense type name cannot be empty.');
  }

  const existing = realm.objects<ExpenseType>('ExpenseType').filtered('name == $0', newName.trim())[0];
  if (existing && !existing._id.equals(id)) {
    throw new Error('Another expense type with this name already exists.');
  }

  const expenseType = realm.objectForPrimaryKey<ExpenseType>('ExpenseType', id);
  if (!expenseType) {
    throw new Error('Expense type not found.');
  }

  realm.write(() => {
    expenseType.name = newName.trim();
  });
};

export const addExpense = (
  amount: number,
  date: Date,
  expenseType: { _id: BSON.ObjectId; name: string }
): void => {
  const realm = getRealm();

  const existingType = realm.objectForPrimaryKey('ExpenseType', expenseType._id);
  if (!existingType) {
    throw new Error('ExpenseType not found in Realm.');
  }

  realm.write(() => {
    realm.create('Expense', {
      _id: new BSON.ObjectId(),
      amount,
      date,
      expenseType: existingType, // relationship
    });
  });
};
