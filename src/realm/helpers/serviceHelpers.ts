import { realm } from '../index';
import { BSON } from 'realm';

export function addService(
  name: string,
  pricePerKg: number,
  description: string,
  icons: string[]
) {
  realm.write(() => {
    realm.create('Service', {
      _id: new BSON.ObjectId(),
      name,
      pricePerKg,
      description,
      icons,
    });
  });
}

export function getAllServices() {
  return realm.objects('Service');
}

export function deleteService(id: BSON.ObjectId) {
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
) {
  const service = realm.objectForPrimaryKey('Service', id);

  if (service) {
    realm.write(() => {
      if (updates.name !== undefined) service.name = updates.name;
      if (updates.pricePerKg !== undefined) service.pricePerKg = updates.pricePerKg;
      if (updates.description !== undefined) service.description = updates.description;
      if (updates.icons !== undefined) service.icons = updates.icons;
    });
  } else {
    console.warn('Service not found for update with id:', id.toHexString());
  }
}
