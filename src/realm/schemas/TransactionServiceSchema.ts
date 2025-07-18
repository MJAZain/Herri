export const TransactionServiceSchema = {
    name: 'TransactionService',
    embedded: true,
    properties: {
      serviceId: 'objectId',
      name: 'string',
      pricePerKg: 'float',
      weight: 'float',
      totalPrice: 'float',
    },
  }
  