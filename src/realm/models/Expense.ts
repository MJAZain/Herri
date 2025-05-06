import { BSON } from 'realm';

export class ExpenseType extends Realm.Object<ExpenseType> {
  _id!: BSON.ObjectId;
  name!: string;

  static schema: Realm.ObjectSchema = {
    name: 'ExpenseType',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
    },
  };
}

export class Expense extends Realm.Object<Expense> {
  _id!: BSON.ObjectId;
  amount!: number;
  date!: Date;
  type!: ExpenseType; // link to the ExpenseType object

  static schema: Realm.ObjectSchema = {
    name: 'Expense',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      amount: 'int',
      date: 'date',
      type: 'ExpenseType',
    },
  };
}
