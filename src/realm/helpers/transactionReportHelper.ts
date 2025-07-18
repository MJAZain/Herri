import { useState, useEffect } from 'react';
import { getRealm } from '..';
import { getMonth, getYear } from 'date-fns';

export const useTransactionStats = () => {
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);

  useEffect(() => {
    const realm = getRealm();

    const now = new Date();
    const monthStart = new Date(getYear(now), getMonth(now), 1);
    const monthEnd = new Date(getYear(now), getMonth(now) + 1, 0, 23, 59, 59);

    const allTransactions = realm.objects('Transaction');

    const updateStats = () => {
      const thisMonthTransactions = allTransactions.filtered(
        'createdAt >= $0 && createdAt <= $1',
        monthStart,
        monthEnd
      );

      setMonthlyCount(thisMonthTransactions.length);
      setCompletedCount(thisMonthTransactions.filtered('status == "completed"').length);
      setQueueCount(thisMonthTransactions.filtered('status == "pending"').length);
      setWaitingCount(thisMonthTransactions.filtered('status == "waiting for pickup"').length);
      setCanceledCount(thisMonthTransactions.filtered('status == "canceled"').length);
    };

    updateStats();

    allTransactions.addListener(updateStats);

    return () => {
      if (allTransactions && allTransactions.removeListener) {
        allTransactions.removeListener(updateStats);
      }
    };
  }, []);

  return {
    monthlyCount,
    completedCount,
    queueCount,
    waitingCount,
    canceledCount,
  };
};
