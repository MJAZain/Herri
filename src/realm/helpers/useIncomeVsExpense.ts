import { useEffect, useState } from 'react';
import { getRealm } from '..';
import { ObjectId } from 'bson';

export const useIncomeVsExpense = () => {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const realm = getRealm();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const earnings = realm
      .objects('Earning')
      .filtered('createdAt >= $0', startOfMonth);

    const expenses = realm
      .objects('Expense')
      .filtered('date >= $0', startOfMonth);

    const earningsSum = earnings.sum('amount');
    const expensesSum = expenses.sum('amount');

    setTotalEarnings(earningsSum);
    setTotalExpenses(expensesSum);
  }, []);

  return { totalEarnings, totalExpenses };
};
