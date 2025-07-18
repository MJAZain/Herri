import Realm from 'realm';
import { getRealm } from '..';

export function getUser() {
  const realm = getRealm();
  const users = realm.objects('User');
  return users.length > 0 ? users[0] : null;
}

export function createUser(name: string, shopName: string, profilePicture?: string) {
  const realm = getRealm();
  try {
    realm.write(() => {
      realm.create('User', {
        _id: new Realm.BSON.ObjectId(),
        name,
        shopName,
        profilePicture: profilePicture ?? '',
      });
    });
    console.log('User created successfully.');
  } catch (error) {
    console.error('Failed to create user:', error);
  }
}

export const deleteUserAndResetApp = () => {
  const realm = getRealm();
  try {
    realm.write(() => {
      for (const schema of realm.schema) {
        if (schema.embedded) continue;
        const allObjects = realm.objects(schema.name);
        realm.delete(allObjects);
      }
    });
    console.log('User and all app data deleted successfully.');
  } catch (error) {
    console.error('Failed to delete user and reset app:', error);
  }
};

type UpdateUserInput = {
  name?: string;
  shopName?: string;
  profilePicture?: string | null;
};

export const editUser = (updatedFields: UpdateUserInput) => {
  const realm = getRealm();
  try {
    const user = realm.objects('User')[0];
    if (!user) {
      console.warn('No user found to update.');
      return;
    }

    realm.write(() => {
      if (updatedFields.name !== undefined) user.name = updatedFields.name;
      if (updatedFields.shopName !== undefined) user.shopName = updatedFields.shopName;
      if (updatedFields.profilePicture !== undefined) user.profilePicture = updatedFields.profilePicture;
    });

    console.log('User updated successfully.');
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};
