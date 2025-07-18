import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'
import { View, StyleSheet } from 'react-native'

import HomeScreen from '../screens/Main/HomeScreen'
import SettingsScreen from '../screens/Main/SettingsScreen'
import ReportScreen from '../screens/Main/ReportScreen'
import TransactionTabs from './TransactionTabs'

import HomeIcon from '../../assets/icons/bottomtabsicon/HomeIcon.svg'
import TransactionIcon from '../../assets/icons/bottomtabsicon/TransactionIcon.svg'
import ReportIcon from '../../assets/icons/bottomtabsicon/Report.svg'
import SettingIcon from '../../assets/icons/bottomtabsicon/Setting.svg'
import FocusIcon from '../../assets/icons/bottomtabsicon/FocusIcon.svg'

const Tab = createBottomTabNavigator()

export default function BottomTabs() {
return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, size }) => {
          let IconComponent

          switch (route.name) {
            case 'Home':
              IconComponent = <HomeIcon width={size} height={size} />
              break
            case 'Transactions':
              IconComponent = <TransactionIcon width={size} height={size} />
              break
            case 'Report':
              IconComponent = <ReportIcon width={size} height={size} />
              break
            case 'Settings':
              IconComponent = <SettingIcon width={size} height={size} />
              break
          }

          return focused ? (
            <View style={styles.activeIconContainer}>
              <FocusIcon style={styles.focusIcon} />
              {IconComponent}
            </View>
          ) : (
            IconComponent
          )
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionTabs} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(235, 234, 229, 1)',
    shadowColor: 'rgba(38, 91, 75, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 1.3,
    elevation: 4,
    height: 70,
    paddingTop: 7.5,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(246, 193, 71, 1)',
    borderRadius: 28,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  focusIcon: {
    position: 'absolute',
    zIndex: -1,
  },
})
