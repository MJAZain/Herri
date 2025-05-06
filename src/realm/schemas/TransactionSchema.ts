export const TransactionSchema = {
  name: 'Transaction',
  properties: {
    _id: 'objectId',
    customer: 'TransactionCustomer',
    services: 'TransactionService[]',
    totalWeight: 'float',
    totalPrice: 'float',
    createdAt: 'date',
    status: 'string',
  },
  primaryKey: '_id',
};
