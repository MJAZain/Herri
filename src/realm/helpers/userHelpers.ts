import { realm } from '../index.ts'

export function getUser() {
  const users = realm.objects('User')
  return users.length > 0 ? users[0] : null
}

export function createUser(name: string, shopName: string, profilePicture?: string) {
  realm.write(() => {
    realm.create('User', {
      _id: new Realm.BSON.ObjectId(),
      name,
      shopName,
      profilePicture: profilePicture || '',
    })
  })
}
