import { useEffect, useState } from 'react';
import { realm } from '../index';

export interface Expense {
  _id: Realm.BSON.ObjectId;
  title: string;
  amount: number;
  date: Date;
}

export interface Earning {
  _id: Realm.BSON.ObjectId;
  transactionId: Realm.BSON.ObjectId;
  amount: number;
  createdAt: Date;
}

const getMonthDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const useMonthlyFinance = () => {
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [earningsTotal, setEarningsTotal] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const { start, end } = getMonthDateRange();

    const expenses = realm
      .objects<Expense>('Expense')
      .filtered('date >= $0 AND date <= $1', start, end);

    const earnings = realm
      .objects<Earning>('Earning')
      .filtered('createdAt >= $0 AND createdAt <= $1', start, end);

    const computeTotals = () => {
      const expenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
      const earningSum = earnings.reduce((sum, e) => sum + e.amount, 0);
      setExpensesTotal(expenseSum);
      setEarningsTotal(earningSum);
      setProfit(earningSum - expenseSum);
    };

    computeTotals(); // Initial
    expenses.addListener(computeTotals);
    earnings.addListener(computeTotals);

    return () => {
      expenses.removeListener(computeTotals);
      earnings.removeListener(computeTotals);
    };
  }, []);

  return {
    expenses: expensesTotal,
    earnings: earningsTotal,
    profit: profit,
    expensesFormatted: formatCurrency(expensesTotal),
    earningsFormatted: formatCurrency(earningsTotal),
    profitFormatted: formatCurrency(profit),
  };
};
