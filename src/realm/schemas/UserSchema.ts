export const UserSchema = {
    name: 'User',
    properties: {
      _id: 'objectId',
      name: 'string',
      shopName: 'string',
      shopAddress: 'string',
      shopPhone: 'string',
      profilePicture: 'string?',
    },
    primaryKey: '_id',
  }
  