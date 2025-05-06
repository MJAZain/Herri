import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { createUser } from '../../realm/helpers/userHelpers'

type AddProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddProfile'>

import { PermissionsAndroid, Platform } from 'react-native'

async function requestStoragePermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Permission needed',
        message: 'This app needs access to your gallery.',
        buttonPositive: 'OK',
      }
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
  }
  return true
}

export default function AddProfileScreen() {
  const [name, setName] = useState('')
  const [shopName, setShopName] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)

  const navigation = useNavigation<AddProfileScreenNavigationProp>()

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Unknown error while picking image')
          return
        }
        const selectedAsset = response.assets?.[0]
        if (selectedAsset?.uri) {
          setImageUri(selectedAsset.uri)
        }
      }
    )
  }

  const handleSave = () => {
    if (!name || !shopName) {
      Alert.alert('Lengkapi Data', 'Nama dan Nama Toko harus diisi.')
      return
    }

    createUser(name, shopName, imageUri || '')
    navigation.navigate('MainTabs')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat datang di E-Herry Laundry</Text>

      <TouchableOpacity onPress={handlePickImage} style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Pilih Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Silahkan masukkan nama anda:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nama Anda"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Silahkan masukkan nama toko anda:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nama Toko"
        value={shopName}
        onChangeText={setShopName}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Simpan Profil</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageWrapper: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
