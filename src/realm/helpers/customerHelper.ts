import { realm } from '../index';
import { BSON } from 'realm';
import { useCallback } from 'react';

export type BasicCustomer = {
  _id: BSON.ObjectId;
  name: string;
  phoneNumber: string;
  address: string;
};


type Customer = {
  _id: BSON.ObjectId;
  name: string;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  transactions: unknown[];
};

export function addOrUpdateCustomer(
  customerName: string,
  phoneNumber: string,
  address: string
): boolean {
  try {
    realm.write(() => {
      let customer = realm.objects<Customer>('Customer').filtered('phoneNumber == $0', phoneNumber)[0];

      if (!customer) {
        customer = realm.create<Customer>('Customer', {
          _id: new BSON.ObjectId(),
          name: customerName,
          phoneNumber,
          address,
          createdAt: new Date(),
          transactions: [],
        });
      } else {
        customer.name = customerName;
        customer.address = address;
      }
    });
    return true;
  } catch (error) {
    console.error('Error adding/updating customer:', error);
    return false;
  }
}

export function getCustomerByPhoneNumber(phoneNumber: string): Customer | null {
  const customer = realm
    .objects<Customer>('Customer')
    .filtered('phoneNumber == $0', phoneNumber)[0];

  return customer ?? null;
}

export const getAllCustomers = (): BasicCustomer[] => {
  const customers = realm.objects('Customer');

  return customers.map((c: any) => ({
    _id: c._id,
    name: c.name,
    address: c.address,
    phoneNumber: c.phoneNumber,
  }));
};

export const useCustomerManager = () => {
  const findOrCreateCustomer = useCallback((name: string, phoneNumber: string, address: string) => {
    const normalized = {
      name: name.trim().toLowerCase(),
      phone: phoneNumber.trim(),
      address: address.trim().toLowerCase(),
    };

    const existing = realm.objects('Customer').filtered(
      'name == $0 AND phoneNumber == $1 AND address == $2',
      normalized.name,
      normalized.phone,
      normalized.address
    )[0];

    if (existing) {
      return existing;
    }

    let newCustomer;
    realm.write(() => {
      newCustomer = realm.create('Customer', {
        _id: new BSON.ObjectId(),
        name: normalized.name,
        phoneNumber: normalized.phone,
        address: normalized.address,
        createdAt: new Date(),
      });
    });

    return newCustomer;
  }, []);

  return { findOrCreateCustomer };
};



