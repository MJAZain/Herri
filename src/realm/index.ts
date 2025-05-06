import Realm from 'realm'
import { UserSchema } from './schemas/UserSchema'
import { ServiceSchema } from './schemas/ServiceSchema'
import { ExpenseSchema } from './schemas/ExpenseSchema'
import { TransactionSchema } from './schemas/TransactionSchema'
import { TransactionServiceSchema } from './schemas/TransactionServiceSchema'
import { EarningSchema } from './schemas/EarningsSchema'
import { CustomerSchema } from './schemas/CustomerSchema'
import { TransactionCustomerSchema } from './schemas/TransactionCustomerSchema'
import { ExpenseType, Expense } from './models/Expense'

export const realm = new Realm({
  schema: [
    UserSchema,
    ServiceSchema,
    ExpenseSchema,
    TransactionSchema,
    TransactionServiceSchema,
    EarningSchema,
    CustomerSchema,
    TransactionCustomerSchema,
    Expense, ExpenseType
  ],
})
