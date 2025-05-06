export const UserSchema = {
    name: 'User',
    properties: {
      _id: 'objectId',
      name: 'string',
      shopName: 'string',
      profilePicture: 'string?', // optional (could be base64 or URI)
    },
    primaryKey: '_id',
  }
  