import { getRealm } from '..';
import { BSON } from 'realm';

export type ServiceInput = {
  name: string;
  pricePerKg: number;
  description: string;
  icons: string[];
};

export function addService(
  name: string,
  pricePerKg: number,
  description: string,
  icons: string[],
  showToast?: (message: string, type?: 'success' | 'error') => void
): boolean {
  try {
    const realm = getRealm();

    const trimmedName = name.trim();
    if (!trimmedName) {
      const msg = 'Service name cannot be empty.';
      showToast?.(msg, 'error');
      return false;
    }

    const existing = realm.objects('Service').filtered('name == $0', trimmedName)[0];
    if (existing) {
      const msg = `A service named "${trimmedName}" already exists.`;
      showToast?.(msg, 'error');
      return false;
    }

    realm.write(() => {
      realm.create('Service', {
        _id: new BSON.ObjectId(),
        name: trimmedName,
        pricePerKg,
        description: description.trim(),
        icons,
      });
    });

    showToast?.('Service added successfully.', 'success');
    return true;
  } catch (error) {
    showToast?.('Failed to add service.', 'error');
    console.error(error);
    return false;
  }
}


export function getAllServices(): Realm.Results<any> {
  const realm = getRealm();
  return realm.objects('Service');
}

export function deleteService(id: BSON.ObjectId): void {
  const realm = getRealm();
  const service = realm.objectForPrimaryKey('Service', id);

  if (service) {
    realm.write(() => {
      realm.delete(service);
    });
  } else {
    console.warn('Service not found for deletion with id:', id.toHexString());
  }
}

export function updateService(
  id: BSON.ObjectId,
  updates: {
    name?: string;
    pricePerKg?: number;
    description?: string;
    icons?: string[];
  }
): void {
  const realm = getRealm();
  const service = realm.objectForPrimaryKey('Service', id);

  if (!service) {
    console.warn('Service not found for update with id:', id.toHexString());
    return;
  }

  realm.write(() => {
    if (updates.name !== undefined) service.name = updates.name.trim();
    if (updates.pricePerKg !== undefined) service.pricePerKg = updates.pricePerKg;
    if (updates.description !== undefined) service.description = updates.description.trim();
    if (updates.icons !== undefined) service.icons = updates.icons;
  });
}
