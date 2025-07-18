import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PendingTransactionsScreen from '../screens/Main/TransactionScreen/PendingTransaction';
import WaitingTransactionsScreen from '../screens/Main/TransactionScreen/WaitingTransaction';
import CompletedTransactionsScreen from '../screens/Main/TransactionScreen/CompletedTransaction';


const TopTab = createMaterialTopTabNavigator();

const TransactionTabs = () => {
  return (
    <View style={{ flex: 1 }}>
  
      <View style={{ flex: 1, zIndex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pesanan</Text>
        </View>

      {/* Tab Navigator */}
      <TopTab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#fff',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
          },
          tabBarLabelStyle: {
            fontFamily: 'Lexend-Bold',
            textTransform: 'none',
            color: '#2c578c',
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#2c578c',
            height: 3,
            borderRadius: 1.5,
          },
        }}
      >
        <TopTab.Screen name="Antrian" component={PendingTransactionsScreen} />
        <TopTab.Screen name="Menunggu di Ambil" component={WaitingTransactionsScreen} />
        <TopTab.Screen name="Selesai" component={CompletedTransactionsScreen} />
      </TopTab.Navigator>
      </View>
    </View>
  );
};

export default TransactionTabs;

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
});

