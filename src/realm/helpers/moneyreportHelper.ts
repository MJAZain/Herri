import { useEffect, useState } from 'react';
import { getRealm } from '..';

export interface Expense {
  _id: Realm.BSON.ObjectId;
  amount: number;
  date: Date;
  expenseType: {
    _id: Realm.BSON.ObjectId;
    name: string;
  };
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

const formatCurrencyCompact = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1_000_000_000) {
    return `${sign}Rp${(absAmount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (absAmount >= 1_000_000) {
    return `${sign}Rp${(absAmount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (absAmount >= 1_000) {
    return `${sign}Rp${(absAmount / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  } else {
    return `${sign}Rp${absAmount}`;
  }
};


export const useMonthlyFinance = () => {
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [earningsTotal, setEarningsTotal] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const realm = getRealm();
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

    computeTotals(); // Initial compute
    expenses.addListener(computeTotals);
    earnings.addListener(computeTotals);

    return () => {
      if (expenses && expenses.removeListener) expenses.removeListener(computeTotals);
      if (earnings && earnings.removeListener) earnings.removeListener(computeTotals);
    };
  }, []);

  return {
    expenses: expensesTotal,
    earnings: earningsTotal,
    profit,
    expensesFormatted: formatCurrencyCompact(expensesTotal),
    earningsFormatted: formatCurrencyCompact(earningsTotal),
    profitFormatted: formatCurrencyCompact(profit),
  };
};
