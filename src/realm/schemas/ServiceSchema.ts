export const ServiceSchema = {
  name: 'Service',
  properties: {
    _id: 'objectId',
    name: 'string',
    description: 'string',
    pricePerKg: 'double',
    icons: 'string[]',
  },
  primaryKey: '_id',
};
