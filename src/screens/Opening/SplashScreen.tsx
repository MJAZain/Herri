import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { getUser } from '../../realm/helpers/userHelpers'
import TitleIcon from '../../../assets/icons/splash/icon.svg'

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
      <TitleIcon width="50%" height="100%" preserveAspectRatio="xMidYMid meet" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
})
