export default () => ({
  // api configuration
  port: parseInt(process.env.PORT ?? '1337', 10),

  // mongodb configuration
  mongoUri:
    process.env.MONGODB_URI ??
    'mongodb://localhost:27017/?retryWrites=true&loadBalanced=false&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000',

  // webhook configuration
  webhookUrl:
    process.env.WEBHOOK_URL ??
    'https://webhook.site/123e4567-e89b-12d3-a456-426614174000',

  // jwt configuration
  expirationTime: process.env.EXPIRATION_TIME ?? '1h',
  jwtSecret: process.env.JWT_SECRET ?? 'Z3vcFnw1iCy4OY7LioPlo6jB',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'defaultRefreshSecret',

  // external payment service configuration
  paymentAccessToken:
    process.env.PAYMENT_ACCESS_TOKEN ??
    'APP_USR-5364548738128566-051913-ed59ec1ef1446cc3754dca8a63e3398b-294388766',
  paymentServiceBaseUrl:
    process.env.PAYMENT_SERVICE_BASE_URL ?? 'https://api.mercadopago.com/v1',
});
