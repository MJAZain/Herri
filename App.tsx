import 'react-native-reanimated';
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RealmProvider } from '@realm/react'

import SplashScreen from './src/screens/Opening/SplashScreen'
import AddProfileScreen from './src/screens/Opening/AddProfileScreen'
import BottomTabs from './src/navigation/BottomTabs'
import ServiceManagementScreen from './src/screens/Laundry/ServiceManagementScreen'
import AddExpenseScreen from './src/screens/Laundry/AddExpenseScreen'
import AddTransactionScreen from './src/screens/Laundry/AddTransactionScreen';
import SearchTransactionsScreen from './src/screens/Laundry/SearchTransactionsScreen';
import ExpenseManagementScreen from './src/screens/Laundry/ExpenseManagementScreen';
import CustomerInputScreen from './src/screens/Laundry/CustomerScreen';
import TransactionDetailScreen from './src/screens/Laundry/TransactionsDetailScreen';

// Realm Schemas
import { UserSchema } from './src/realm/schemas/UserSchema'
import { ServiceSchema } from './src/realm/schemas/ServiceSchema'
import { ExpenseSchema } from './src/realm/schemas/ExpenseSchema'
import { TransactionSchema } from './src/realm/schemas/TransactionSchema'
import { TransactionServiceSchema } from './src/realm/schemas/TransactionServiceSchema'
import { EarningSchema } from './src/realm/schemas/EarningsSchema'
import { CustomerSchema } from './src/realm/schemas/CustomerSchema';
import { TransactionCustomerSchema } from './src/realm/schemas/TransactionCustomerSchema';

export type RootStackParamList = {
  Splash: undefined
  AddProfile: undefined
  MainTabs: undefined
  ServiceManagement: undefined
  AddExpense: undefined
  AddTransaction: { phoneNumber: string }
  SearchTransaction: undefined
  ExpenseManagement: undefined
  CustomerInput: undefined
  TransactionDetail: { transactionId: string };

}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <RealmProvider schema={[UserSchema, EarningSchema, ServiceSchema, ExpenseSchema, TransactionSchema, TransactionServiceSchema, CustomerSchema, TransactionCustomerSchema]}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddProfile" component={AddProfileScreen} options={{ title: 'Profil Pengguna' }} />
          <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SearchTransaction" component={SearchTransactionsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CustomerInput" component={CustomerInputScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseManagement" component={ExpenseManagementScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ServiceManagement" component={ServiceManagementScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </RealmProvider>
  )
}
