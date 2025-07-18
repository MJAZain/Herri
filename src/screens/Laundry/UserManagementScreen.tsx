import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getUser, editUser, deleteUserAndResetApp } from '../../realm/helpers/userHelpers';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../App'
import Modal from 'react-native-modal';
import { UserCircleIcon } from 'react-native-heroicons/outline'

import BGSplash from '../../../assets/icons/splash/bgsplash.svg'
import DefaultPFPIcon from '../../../assets/icons/DefaultPFP.svg'

type UserManagementScreenProp = NativeStackNavigationProp<RootStackParamList, 'UserManagement'>;

const UserManagementScreen = () => {
    
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(5);
  const [deleteEnabled, setDeleteEnabled] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    const user = getUser();
    if (user) {
      setName(String(user.name));
      setShopName(String(user.shopName));
      setProfilePicture(user.profilePicture ? String(user.profilePicture) : null);
    }
  }, []);

  const handleSave = () => {
    editUser({ name, shopName, profilePicture });
  };

  const showDeleteModal = () => {
    setModalVisible(true);
    setDeleteEnabled(false);
    setDeleteTimer(5);

    const countdown = setInterval(() => {
      setDeleteTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          setDeleteEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirmDelete = () => {
    deleteUserAndResetApp();
    setModalVisible(false);
   navigation.navigate('Splash')
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      (response) => {
        const uri = response?.assets?.[0]?.uri;
        if (typeof uri === 'string') {
          setProfilePicture(uri);
        }
      }
    );
  };

  return (
    <View>
      <BGSplash width="100%" height="150%" style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      ></KeyboardAvoidingView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atur Profile</Text>
      </View> 
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageWrapper}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.image} />
            ) : (
                <DefaultPFPIcon style={styles.avatar} />
            )}
            <TouchableOpacity onPress={handlePickImage} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Foto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nama:</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Nama Toko:</Text>
          <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />

          <TouchableOpacity style={styles.savebutton} onPress={handleSave}>
            <Text style={styles.save}>Simpan Perubahan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deletebutton} onPress={showDeleteModal}>
            <Text style={styles.delete}>Hapus Akun</Text>
          </TouchableOpacity>

          <Modal isVisible={isModalVisible}>
            <View style={styles.modal}>
              <Text style={styles.modalText}>Apa Anda Yakin?</Text>
              <Text style={styles.modalText}>Ini akan menghapus semua data yang anda miliki.</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!deleteEnabled}
                  onPress={handleConfirmDelete}
                  style={[
                    styles.deleteButton,
                    { backgroundColor: deleteEnabled ? 'red' : '#ccc' },
                  ]}
                >
                  <Text style={styles.deleteButtonText}>
                    Delete {deleteEnabled ? '' : `(${deleteTimer}s)`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  editButton: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontFamily: "Lexend-Bold"
  },
  savebutton: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'center',
    margin: 20
  },
  save: {
    fontFamily: 'Lexend-Regular',
    color: '#fff',
    padding: 4
  },
  delete: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
    padding: 4
  },
  deletebutton: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  placeholder: {
    backgroundColor: '#ccc',
    fontFamily: 'Lexend-Regular'
    },
  container: {
    margin: 16,
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
  imageWrapper: {
    alignSelf: 'center',
    margin: 20
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontFamily: 'Lexend-Bold',
    color: 'rgb(0, 0, 0)'
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
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Bold'
  },
  footer: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    zIndex: 10,
    height: 50
  },
});

export default UserManagementScreen;
