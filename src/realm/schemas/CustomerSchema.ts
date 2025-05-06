export const CustomerSchema = {
    name: 'Customer',
    properties: {
      _id: 'objectId',
      name: 'string',
      phoneNumber: 'string',
      address: 'string',
      createdAt: 'date',
      transactions: 'Transaction[]',
    },
    primaryKey: '_id',
  };
  