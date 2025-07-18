export const ExpenseSchema = {
  name: 'Expense',
  properties: {
    _id: 'objectId',
    amount: 'float',
    date: 'date',
    expenseType: 'ExpenseType',
  },
  primaryKey: '_id',
};
