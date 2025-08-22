export const UserSchema = {
    name: 'User',
    properties: {
      _id: 'objectId',
      name: 'string',
      shopName: 'string',
      shopAddress: 'string',
      profilePicture: 'string?',
    },
    primaryKey: '_id',
  }
  