import { BSON } from 'realm';

export type ExpenseType = {
  _id: BSON.ObjectId;
  name: string;
};

export type Expense = {
  _id: BSON.ObjectId;
  amount: number;
  date: Date;
  expenseType: ExpenseType;
};

export type TransactionService = {
  serviceId: BSON.ObjectId;
  name: string;
  pricePerKg: number;
  weight: number;
  totalPrice: number;
};

export type TransactionCustomer = {
  customerId: BSON.ObjectId;
  name: string;
  phoneNumber: string;
  address: string;
};

export type Transaction = {
  _id: BSON.ObjectId;
  customer: TransactionCustomer;
  services: TransactionService[];
  totalWeight: number;
  totalPrice: number;
  createdAt: Date;
  status: string;
};
