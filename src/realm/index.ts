import Realm from 'realm';
import { ExpenseTypeSchema } from './schemas/ExpenseTypeSchme';
import { UserSchema } from './schemas/UserSchema';
import { EarningSchema } from './schemas/EarningsSchema';
import { ServiceSchema } from './schemas/ServiceSchema';
import { ExpenseSchema } from './schemas/ExpenseSchema';
import { TransactionSchema } from './schemas/TransactionSchema';
import { TransactionServiceSchema } from './schemas/TransactionServiceSchema';
import { CustomerSchema } from './schemas/CustomerSchema';
import { TransactionCustomerSchema } from './schemas/TransactionCustomerSchema';

export const schemas = [
  ExpenseTypeSchema,
  UserSchema,
  EarningSchema,
  ServiceSchema,
  ExpenseSchema,
  TransactionSchema,
  TransactionServiceSchema,
  CustomerSchema,
  TransactionCustomerSchema,
];

let realmInstance: Realm | null = null;
export const SCHEMA_VERSION = 1;

export const onMigration = (oldRealm: Realm, newRealm: Realm) => {
  if (oldRealm.schemaVersion < SCHEMA_VERSION) {
    console.log(
      `[Realm] Migrated from schema version ${oldRealm.schemaVersion} to ${SCHEMA_VERSION}`
    );

  }
};

export const getRealm = (): Realm => {
  if (realmInstance && !realmInstance.isClosed) {
    return realmInstance;
  }

  try {
    realmInstance = new Realm({
      schema: schemas,
      schemaVersion: SCHEMA_VERSION,
      onMigration
    });
  } catch (error) {
    console.error('[Realm] Failed to open Realm:', error);
    throw error;
  }

  return realmInstance;
};

export const closeRealm = () => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};