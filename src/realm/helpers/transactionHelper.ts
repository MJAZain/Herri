import { BSON } from 'realm';
import { realm } from '../index';
import { TransactionService, TransactionCustomer } from '../../types/types';
import { ObjectId } from 'bson';

interface ServiceItem {
  serviceId: BSON.ObjectId;
  name: string;
  pricePerKg: number;
  weight: number;
  totalPrice: number;
}

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


export function addTransaction(
  customerName: string,
  phoneNumber: string,
  address: string,
  services: ServiceItem[]
) {
  const totalWeight = services.reduce((sum, s) => sum + s.weight, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.totalPrice, 0);

  realm.write(() => {
    const customerSnapshot = {
      customerId: new BSON.ObjectId(),
      name: customerName,
      phoneNumber,
      address,
    };

    const transaction = realm.create('Transaction', {
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

export function completeTransaction(id: BSON.ObjectId, amount: number) {
    realm.write(() => {
      const transaction = realm.objectForPrimaryKey('Transaction', id);
      if (transaction) {
        transaction.status = 'completed';
  
        realm.create('Earning', {
          _id: new BSON.ObjectId(),
          transactionId: id,
          amount,
          createdAt: new Date(),
        });
      }
    });
  }
  
export function cancelTransaction(id: BSON.ObjectId) {
    realm.write(() => {
      const transaction = realm.objectForPrimaryKey('Transaction', id);
      if (transaction) {
        transaction.status = 'canceled';
      }
    });
}

export function getAllTransactions() {
    return realm.objects('Transaction');
}

export const getTransactionsByCustomer = (query: string): Transaction[] => {
  const transactions = realm.objects<Transaction>('Transaction');

  return transactions
    .filtered(
      'customer.name CONTAINS[c] $0 OR customer.phoneNumber CONTAINS[c] $0 OR customer.address CONTAINS[c] $0',
      query
    )
    .map((t) => ({
      _id: t._id,
      customer: t.customer,
      services: t.services,
      totalWeight: t.totalWeight,
      totalPrice: t.totalPrice,
      createdAt: t.createdAt,
      status: t.status,
    }));
};

export const getTransactionById = (id: string): Transaction | null => {
  const raw = realm.objectForPrimaryKey('Transaction', new Realm.BSON.ObjectId(id));

  if (!raw) return null;

  const result = raw as unknown as {
    _id: ObjectId;
    customer: Transaction['customer'];
    services: Transaction['services'];
    totalWeight: number;
    totalPrice: number;
    createdAt: Date;
    status: string;
  };

  return {
    _id: result._id,
    customer: result.customer,
    services: result.services,
    totalWeight: result.totalWeight,
    totalPrice: result.totalPrice,
    createdAt: result.createdAt,
    status: result.status,
  };
};

