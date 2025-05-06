export const TransactionCustomerSchema = {
  name: 'TransactionCustomer',
  embedded: true,
  properties: {
    customerId: 'objectId',
    name: 'string',
    phoneNumber: 'string',
    address: 'string',
  },
};
