import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RealmProvider } from '@realm/react';

// Screens
import SplashScreen from './src/screens/Opening/SplashScreen';
import AddProfileScreen from './src/screens/Opening/AddProfileScreen';
import BottomTabs from './src/navigation/BottomTabs';
import ServiceManagementScreen from './src/screens/Laundry/ServiceManagementScreen';
import AddExpenseScreen from './src/screens/Laundry/AddExpenseScreen';
import AddTransactionScreen from './src/screens/Laundry/AddTransactionScreen';
import SearchTabs from './src/navigation/SearchTabs';
import ExpenseManagementScreen from './src/screens/Laundry/ExpenseManagementScreen';
import CustomerInputScreen from './src/screens/Laundry/CustomerScreen';
import TransactionDetailScreen from './src/screens/Laundry/TransactionsDetailScreen';
import PrinterSettingsScreen from './src/screens/Laundry/PrinterSettingScreen';
import UserManagementScreen from './src/screens/Laundry/UserManagementScreen';
import CustomerManagementScreen from './src/screens/Laundry/CustomerManagementScreen';
import ExpenseReportScreen from './src/screens/Laundry/ExpenseReportScreen';
import SalesReportScreen from './src/screens/Laundry/SalesReportScreen';
import CustomerReportScreen from './src/screens/Laundry/CustomerReportScreen';
import RiwayatTransaksiScreen from './src/screens/Laundry/HistoryScreen';
import ExpenseDetailScreen from './src/screens/Laundry/ExpenseDetailScreen';

// Realm
import { schemas, SCHEMA_VERSION, onMigration } from './src/realm';

export type RootStackParamList = {
  Splash: undefined;
  AddProfile: undefined;
  MainTabs: undefined;
  SearchTabs: undefined;
  ServiceManagement: undefined;
  AddExpense: undefined;
  AddTransaction: { phoneNumber: string };
  SearchTransaction: undefined;
  ExpenseManagement: undefined;
  CustomerInput: undefined;
  TransactionDetail: { transactionId: string };
  PrinterSetting: undefined;
  UserManagement: undefined;
  CustomerManagement: undefined;
  ExpenseReport: undefined;
  CustomerReport: undefined;
  SalesReport: undefined;
  HistoryScreen: undefined
  ExpenseDetail: { expenseId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <RealmProvider 
      schema={schemas}
      schemaVersion={SCHEMA_VERSION}
      onMigration={onMigration}
      >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddProfile" component={AddProfileScreen} options={{ headerShown: false  }} />
          <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SearchTabs" component={SearchTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CustomerInput" component={CustomerInputScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PrinterSetting" component={PrinterSettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseManagement" component={ExpenseManagementScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ServiceManagement" component={ServiceManagementScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CustomerReport" component={CustomerReportScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseReport" component={ExpenseReportScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SalesReport" component={SalesReportScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HistoryScreen" component={RiwayatTransaksiScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CustomerManagement" component={CustomerManagementScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </RealmProvider>
  );
}
