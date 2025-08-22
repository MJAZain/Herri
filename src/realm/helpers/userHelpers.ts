import Realm from 'realm';
import { getRealm } from '..';
import { useEffect, useState } from 'react';

export function getUser() {
  const realm = getRealm();
  const users = realm.objects('User');
  return users.length > 0 ? users[0] : null;
}

export function createUser(name: string, shopName: string, shopAddress: string, profilePicture?: string) {
  const realm = getRealm();
  try {
    realm.write(() => {
      realm.create('User', {
        _id: new Realm.BSON.ObjectId(),
        name,
        shopName,
        shopAddress,
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
  shopAddress?: string;
  profilePicture?: string | null;
};

export const editUser = async (updatedFields: UpdateUserInput) => {
  const realm = getRealm();
  try {
    await new Promise((resolve, reject) => {
      realm.write(() => {
        const user = realm.objects('User')[0];
        if (!user) {
          reject(new Error('No user found to update'));
          return;
        }

        if (updatedFields.hasOwnProperty('name')) {
          user.name = updatedFields.name;
        }
        if (updatedFields.hasOwnProperty('shopName')) {
          user.shopName = updatedFields.shopName;
        }
        if (updatedFields.hasOwnProperty('shopAddress')) {
          user.shopAddress = updatedFields.shopAddress;
        }
        if ('profilePicture' in updatedFields) {
          user.profilePicture = updatedFields.profilePicture;
        }
        resolve(true);
      });
    });
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update profile: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

type User = {
  _id: Realm.BSON.ObjectId;
  name: string;
  shopName: string;
  shopAddress: string;
  profilePicture?: string | null;
};

export const useCurrentUser = (): User | null => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const realm = getRealm();
    const users = realm.objects<User>('User') as unknown as Realm.Results<User>;
    
    // Initial update
    const updateUser = () => {
      const firstUser = users.isEmpty() ? null : users[0];
      setCurrentUser(firstUser);
    };
    
    updateUser();
    
    // Add listener
    users.addListener(updateUser);

    return () => {
      users.removeListener(updateUser);
    };
  }, []);

  return currentUser;
};