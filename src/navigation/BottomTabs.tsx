import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'

import HomeScreen from '../screens/Main/HomeScreen'
import SettingsScreen from '../screens/Main/SettingsScreen'
import TransactionsScreen from '../screens/Main/TransactionsScreen'
import ReportScreen from '../screens/Main/ReportScreen'

const Tab = createBottomTabNavigator()

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = ''

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline'
              break
            case 'Transactions':
              iconName = 'list-outline'
              break
            case 'Report':
              iconName = 'bar-chart-outline'
              break
            case 'Settings':
              iconName = 'settings-outline'
              break
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}
