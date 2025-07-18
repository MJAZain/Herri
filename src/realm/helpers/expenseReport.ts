import { useEffect, useState } from 'react';
import { getYear, getMonth, format } from 'date-fns';
import { getRealm } from '..';
import { Expense } from '../types';

type ExpenseBreakdown = {
  type: string;
  total: number;
};

type MonthlyTrend = Record<string, { month: string; total: number }[]>;

export const useExpenseReport = () => {
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState(0);
  const [breakdown, setBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend>({});

  useEffect(() => {
    const realm = getRealm();
    const now = new Date();
    const currentYear = getYear(now);

    const expenses = realm.objects('Expense').filtered('date >= $0', new Date(currentYear, 0, 1));

    const currentMonthStart = new Date(currentYear, getMonth(now), 1);
    const currentMonthEnd = new Date(currentYear, getMonth(now) + 1, 0, 23, 59, 59);

    const monthlyExpenses = expenses.filtered('date >= $0 && date <= $1', currentMonthStart, currentMonthEnd);

    let monthlyTotal = 0;
    const barTotals: Record<string, number> = {};

    monthlyExpenses.forEach((e: any) => {
      monthlyTotal += e.amount;
      const type = e.expenseType?.name || 'Unknown';
      barTotals[type] = (barTotals[type] || 0) + e.amount;
    });

    setTotalMonthlyExpense(monthlyTotal);
    setBreakdown(Object.entries(barTotals).map(([type, total]) => ({ type, total })));

    const trends: MonthlyTrend = {};

    expenses.forEach((e: any) => {
      const type = e.expenseType?.name || 'Unknown';
      const month = format(e.date, 'MMM yyyy');

      if (!trends[type]) trends[type] = [];
      const existing = trends[type].find((m) => m.month === month);
      if (existing) {
        existing.total += e.amount;
      } else {
        trends[type].push({ month, total: e.amount });
      }
    });

    Object.keys(trends).forEach((type) => {
      trends[type].sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    });

    setMonthlyTrends(trends);
  }, []);

  return { totalMonthlyExpense, breakdown, monthlyTrends };
};

export function getAllExpenses() {
  const realm = getRealm();
  if (realm.isClosed) {
    console.warn("⚠️ Realm is closed!");
  }
  return realm.objects<Expense>('Expense');
}