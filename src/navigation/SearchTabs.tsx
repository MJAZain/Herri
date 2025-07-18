import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SearchTransactionsScreen from '../screens/Laundry/SearchScreen/SearchTransactions';
import SearchExpensesScreen from '../screens/Laundry/SearchScreen/SearchExpenses';

const TopTab = createMaterialTopTabNavigator();

const SearchTabs = () => {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pencarian Transaksi</Text>
      </View>

      <TopTab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIndicatorStyle: styles.tabBarIndicator,
        }}
      >
        <TopTab.Screen
          name="Transactions"
          component={SearchTransactionsScreen}
          options={{ tabBarLabel: 'Transaksi' }}
        />
        <TopTab.Screen
          name="Expenses"
          component={SearchExpensesScreen}
          options={{ tabBarLabel: 'Pengeluaran' }}
        />
      </TopTab.Navigator>
    </>
  );
};

export default SearchTabs;

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    color: '#fff',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabBarLabel: {
    fontFamily: 'Lexend-Bold',
    textTransform: 'none',
    color: '#2c578c',
  },
  tabBarIndicator: {
    backgroundColor: '#2c578c',
    height: 3,
    borderRadius: 1.5,
  },
});
