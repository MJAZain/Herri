import { useCallback } from 'react';
import Realm, { BSON } from 'realm';
import { getRealm } from '..';

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

export function addCustomer(
  name: string,
  phoneNumber: string,
  address: string
): boolean {
  const realm = getRealm();

  try {
    const duplicate = realm
      .objects<Customer>('Customer')
      .filtered('name == $0 AND phoneNumber == $1', name, phoneNumber)[0];

    if (duplicate) {
      console.warn('Customer already exists with the same name and phone number.');
      return false;
    }

    realm.write(() => {
      realm.create<Customer>('Customer', {
        _id: new BSON.ObjectId(),
        name,
        phoneNumber,
        address,
        createdAt: new Date(),
        transactions: [],
      });
    });

    return true;
  } catch (error) {
    console.error('Error adding customer:', error);
    return false;
  }
}

export function updateCustomer(
  phoneNumber: string,
  updatedFields: Partial<Pick<Customer, 'name' | 'address'>>
): boolean {
  const realm = getRealm();

  try {
    const customer = realm
      .objects<Customer>('Customer')
      .filtered('phoneNumber == $0', phoneNumber)[0];

    if (!customer) {
      console.warn('Customer not found for update.');
      return false;
    }

    realm.write(() => {
      if (updatedFields.name) customer.name = updatedFields.name;
      if (updatedFields.address) customer.address = updatedFields.address;
    });

    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
}

export function deleteCustomer(id: BSON.ObjectId): void {
  const realm = getRealm();

  realm.write(() => {
    const customer = realm.objectForPrimaryKey('Customer', id);

    if (!customer) {
      console.warn('Customer not found with id:', id.toHexString());
      return;
    }

    realm.delete(customer);
  });
}

export function getCustomerByPhoneNumber(phoneNumber: string): Customer | null {
  const customer = getRealm()
    .objects<Customer>('Customer')
    .filtered('phoneNumber == $0', phoneNumber)[0];

  return customer ?? null;
}

export const getAllCustomers = (): BasicCustomer[] => {
  const realm = getRealm();
  const customers = realm.objects('Customer');

  return customers.map((c: any) => ({
    _id: c._id,
    name: c.name,
    phoneNumber: c.phoneNumber,
    address: c.address,
  }));
};

export const useCustomerManager = () => {
  const findOrCreateCustomer = useCallback((name: string, phoneNumber: string, address: string) => {
    const realm = getRealm();

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
        transactions: [],
      });
    });

    return newCustomer;
  }, []);

  return { findOrCreateCustomer };
};
