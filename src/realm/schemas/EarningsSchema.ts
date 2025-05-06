export const EarningSchema = {
    name: 'Earning',
    properties: {
      _id: 'objectId',
      transactionId: 'objectId',
      amount: 'float',
      createdAt: 'date',
    },
    primaryKey: '_id',
  };
  