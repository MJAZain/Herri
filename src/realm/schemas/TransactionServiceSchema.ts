export const TransactionServiceSchema = {
    name: 'TransactionService',
    embedded: true,
    properties: {
      serviceId: 'objectId', // Link back to Service
      name: 'string',
      pricePerKg: 'float',
      weight: 'float',
      totalPrice: 'float',
    },
  }
  