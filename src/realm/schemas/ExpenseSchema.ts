export const ExpenseSchema = {
  name: 'Expense',
  properties: {
    _id: 'objectId',
    title: 'string',
    amount: 'float',
    date: 'date',
  },
  primaryKey: '_id',
};
