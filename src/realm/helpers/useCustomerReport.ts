import { useEffect, useState } from 'react';
import { getRealm } from '..';
import { format } from 'date-fns';

type CustomerData = {
  customerId: string;
  name: string;
  totalSpent: number;
  transactions: number;
  firstTransactionDate: Date;
};

export const useCustomerReport = () => {
  const [newCount, setNewCount] = useState(0);
  const [returningCount, setReturningCount] = useState(0);
  const [topLoyalCustomers, setTopLoyalCustomers] = useState<CustomerData[]>([]);
  const [customerLTVs, setCustomerLTVs] = useState<CustomerData[]>([]);

  useEffect(() => {
    const realm = getRealm();
    const transactions = realm.objects('Transaction');

    const customerMap: Record<string, CustomerData> = {};

    transactions.forEach((txn: any) => {
      const { customerId, name } = txn.customer;
      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          customerId,
          name,
          totalSpent: 0,
          transactions: 0,
          firstTransactionDate: new Date(txn.createdAt),
        };
      }
      customerMap[customerId].transactions += 1;
      customerMap[customerId].totalSpent += txn.totalPrice;
      const currentFirst = customerMap[customerId].firstTransactionDate;
      if (txn.createdAt < currentFirst) {
        customerMap[customerId].firstTransactionDate = txn.createdAt;
      }
    });

    const customers = Object.values(customerMap);

    const newC = customers.filter((c) => c.transactions === 1).length;
    const returningC = customers.filter((c) => c.transactions > 1).length;

    const topLoyal = [...customers]
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 5);

    const sortedLTVs = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

    setNewCount(newC);
    setReturningCount(returningC);
    setTopLoyalCustomers(topLoyal);
    setCustomerLTVs(sortedLTVs);
  }, []);

  return { newCount, returningCount, topLoyalCustomers, customerLTVs };
};
