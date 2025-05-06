import { BSON } from 'realm';
import { ObjectId } from 'bson';

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

export type TransactionService = {
  serviceId: ObjectId;
  name: string;
  pricePerKg: number;
  weight: number;
  totalPrice: number;
};
