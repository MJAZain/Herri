import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { createUser } from '../../realm/helpers/userHelpers'
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import BGSplash from '../../../assets/icons/splash/bgsplash.svg'
import Toast from '../../components/toast'

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
  const [isScreenReady, setIsScreenReady] = useState(false);
  const [name, setName] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const navigation = useNavigation<AddProfileScreenNavigationProp>()

  useFocusEffect(
    useCallback(() => {
      setIsScreenReady(true);
      return () => setIsScreenReady(false);
    }, [])
  );

 const handlePickImage = () => {
    if (!isScreenReady) return;

    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          const errorMessage =
            response.errorMessage || (response as Error)?.message || 'Unknown error while picking image';

          showToast(errorMessage, 'error');
          return;
        }

        const selectedAsset = response.assets?.[0];
        if (selectedAsset?.uri) {
          setImageUri(selectedAsset.uri);
        }
      }
    );
  };

  const handleSave = () => {
    if (!name || !shopName || !shopAddress) {
      showToast('Nama dan Nama Toko harus diisi.', 'error');
      return;
    }

    createUser(name, shopName, shopAddress, imageUri || '');
    navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    })
  );
  };

  return (
    <View style={styles.container}>
      <BGSplash width="100%" height="100%" style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Selamat datang di Herri Laundry</Text>
      </View>      

      <TouchableOpacity onPress={handlePickImage} style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Pilih Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.containerInput}>
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

      <Text style={styles.label}>Silahkan masukkan alamat toko anda:</Text>
      <TextInput
        style={styles.input}
        placeholder="Alamat Toko"
        value={shopAddress}
        onChangeText={setShopAddress}
      />

      <TouchableOpacity style={styles.save} onPress={handleSave}>
        <Text style={styles.savebutton}>Simpan Profil</Text>
      </TouchableOpacity>
      </View>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
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
    color: '#fff',
    fontFamily: 'Lexend-Bold'
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageWrapper: {
    alignSelf: 'center',
    margin: 16
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
    fontFamily: 'Lexend-Regular'
  },
  label: {
    marginTop: 10,
    fontFamily: 'Lexend-Bold',
    color: 'rgb(0, 0, 0)'
  },
    savebutton: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'center',
    margin: 20,
    color: 'rgba(251, 247, 238, 1)',
    fontFamily: 'Lexend-Bold',
  },
  save: {
    padding: 4
  },
  containerInput: {
    margin: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
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
