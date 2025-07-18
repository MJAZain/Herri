import { BSON } from 'realm';
import { getRealm } from '..';
import { ObjectId } from 'bson';
import Realm from 'realm';
import { useEffect, useState } from 'react';

export type Transaction = {
  _id: BSON.ObjectId;
  customer: {
    customerId: BSON.ObjectId;
    name: string;
    phoneNumber: string;
    address: string;
  };
  services: {
    serviceId: BSON.ObjectId;
    name: string;
    pricePerKg: number;
    weight: number;
    totalPrice: number;
  }[];
  totalWeight: number;
  totalPrice: number;
  createdAt: Date;
  status: string;
};

export type TransactionCustomer = {
  customerId: ObjectId;
  name: string;
  phoneNumber: string;
  address: string;
};

export type ServiceItem = {
  serviceId: BSON.ObjectId;
  name: string;
  pricePerKg: number;
  weight: number;
  totalPrice: number;
};

export function addTransaction(
  customerName: string,
  phoneNumber: string,
  address: string,
  services: ServiceItem[]
): void {
  const realm = getRealm();

  const totalWeight = services.reduce((sum, s) => sum + s.weight, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.totalPrice, 0);

  realm.write(() => {
    const customerSnapshot = {
      customerId: new BSON.ObjectId(),
      name: customerName,
      phoneNumber,
      address,
    };

    realm.create('Transaction', {
      _id: new BSON.ObjectId(),
      customer: customerSnapshot,
      services,
      totalWeight,
      totalPrice,
      createdAt: new Date(),
      status: 'pending',
    });
  });
}

export function completeTransaction(id: BSON.ObjectId, amount: number): void {
  const realm = getRealm();

  realm.write(() => {
    const transaction = realm.objectForPrimaryKey('Transaction', id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id.toHexString()} not found`);
    }

    transaction.status = 'completed';

    realm.create('Earning', {
      _id: new BSON.ObjectId(),
      transactionId: id,
      amount,
      createdAt: new Date(),
    });
  });
}

export function cancelTransaction(id: BSON.ObjectId): void {
  const realm = getRealm();

  realm.write(() => {
    const transaction = realm.objectForPrimaryKey('Transaction', id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id.toHexString()} not found`);
    }

    transaction.status = 'canceled';
  });
}

export function updateTransactionStatus(
  transactionId: BSON.ObjectId,
  newStatus: 'pending' | 'waiting for pickup' | 'completed' | 'canceled'
): void {
  const realm = getRealm();

  realm.write(() => {
    const transaction = realm.objectForPrimaryKey('Transaction', transactionId);
    if (!transaction) {
      throw new Error(`Transaction with id ${transactionId.toHexString()} not found`);
    }
    transaction.status = newStatus;
  });
}

export function getAllTransactions() {
  const realm = getRealm();
  if (realm.isClosed) {
    console.warn("⚠️ Realm is closed!");
  }

  return realm.objects<Transaction>('Transaction');
}


export const useTransactionsByCustomer = (query: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let realm: Realm;

    const fetchTransactions = async () => {
      try {
        realm = await getRealm();

        const results = realm
          .objects<Transaction>('Transaction')
          .filtered(
            'customer.name CONTAINS[c] $0 OR customer.phoneNumber CONTAINS[c] $0 OR customer.address CONTAINS[c] $0',
            query
          );

        const plainResults = results.map((t) => ({
          _id: t._id,
          customer: t.customer,
          services: t.services,
          totalWeight: t.totalWeight,
          totalPrice: t.totalPrice,
          createdAt: t.createdAt,
          status: t.status,
        }));

        setTransactions(plainResults);
      } catch (e) {
        console.error('Error fetching transactions:', e);
      }
    };

    fetchTransactions();

    return () => {
      if (realm && !realm.isClosed) {
        realm.close();
      }
    };
  }, [query]);

  return transactions;
};

export const getTransactionById = (id: string): Transaction | null => {
  const realm = getRealm();
  const raw = realm.objectForPrimaryKey<Realm.Object & Transaction>('Transaction', new BSON.ObjectId(id));

  if (!raw) return null;

  return {
    _id: raw._id,
    customer: raw.customer,
    services: raw.services,
    totalWeight: raw.totalWeight,
    totalPrice: raw.totalPrice,
    createdAt: raw.createdAt,
    status: raw.status,
  };
};
