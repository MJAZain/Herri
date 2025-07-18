import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type EditModalProps = {
  visible: boolean;
  title: string;
  value: string;
  placeholder?: string;
  onClose: () => void;
  onSave: (newValue: string) => void;
};

export const EditModal: React.FC<EditModalProps> = ({
  visible,
  title,
  value,
  placeholder,
  onClose,
  onSave,
}) => {
  const [text, setText] = React.useState(value);

  React.useEffect(() => {
    setText(value);
  }, [value, visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalWrapper}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            autoFocus
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSave(text);
                onClose();
              }}
              style={styles.button}
            >
              <Text style={styles.saveText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Lexend-Regular'
  },
  input: {
    backgroundColor: '#fff',
    borderColor: 'rgba(44, 87, 140, 1)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 3,
    color: 'rgba(44, 87, 140, 1)',
    fontFamily: 'Lexend-Regular'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 12,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    padding: 6,
  },
  saveText: {
    color: 'rgba(44, 87, 140, 1)',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Lexend-Regular',
    padding: 6
  },
});
