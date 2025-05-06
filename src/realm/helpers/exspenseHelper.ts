import { realm } from '../index';
import { BSON } from 'realm';
import { useEffect, useState } from 'react';

export interface Expense {
  _id: BSON.ObjectId;
  title: string;
  amount: number;
  date: Date;
}

export function addExpense(title: string, amount: number, date: Date) {
  realm.write(() => {
    realm.create('Expense', {
      _id: new BSON.ObjectId(),
      title,
      amount,
      date,
    });
  });
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const results = realm.objects<Expense>('Expense').sorted('date', true);

    const mapData = () => {
      setExpenses(results.map(e => ({ ...e } as Expense)));
    };

    mapData();
    results.addListener(mapData);

    return () => results.removeAllListeners();
  }, []);

  const deleteExpense = (id: BSON.ObjectId) => {
    const expense = realm.objectForPrimaryKey<Expense>('Expense', id);
    if (expense) {
      realm.write(() => {
        realm.delete(expense);
      });
    }
  };

  const updateExpense = (
    id: BSON.ObjectId,
    updatedFields: Partial<Pick<Expense, 'title' | 'amount'>>
  ) => {
    const expense = realm.objectForPrimaryKey<Expense>('Expense', id);
    if (expense) {
      realm.write(() => {
        if (updatedFields.title !== undefined) {
          expense.title = updatedFields.title;
        }
        if (updatedFields.amount !== undefined) {
          expense.amount = updatedFields.amount;
        }
      });
    }
  };

  return { expenses, deleteExpense, updateExpense };
};
