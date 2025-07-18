import React from 'react';
import TransactionScreen from '../TransactionsScreen';

const WaitingTransactionsScreen = () => {
  return <TransactionScreen status="waiting for pickup" title="Waiting for Pickup" />;
};

export default WaitingTransactionsScreen;
