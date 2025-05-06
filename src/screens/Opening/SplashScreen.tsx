import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App' // Import RootStackParamList from App.tsx
import { getUser } from '../../realm/helpers/userHelpers'

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>()

  useEffect(() => {
    const timer = setTimeout(() => {
      const user = getUser()
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AddProfile' }],
        })
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat datang di E-Herry Laundry</Text>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
})
