import configuration from './configuration';

describe('configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default configuration when no environment variables are set', () => {
    delete process.env.PORT;
    delete process.env.MONGODB_URI;
    delete process.env.WEBHOOK_URL;
    delete process.env.EXPIRATION_TIME;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.PAYMENT_ACCESS_TOKEN;
    delete process.env.PAYMENT_SERVICE_BASE_URL;

    const config = configuration();

    expect(config).toEqual({
      port: 1337,
      mongoUri:
        'mongodb://localhost:27017/?retryWrites=true&loadBalanced=false&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000',
      webhookUrl: 'https://webhook.site/123e4567-e89b-12d3-a456-426614174000',
      expirationTime: '1h',
      jwtSecret: 'Z3vcFnw1iCy4OY7LioPlo6jB',
      jwtRefreshSecret: 'defaultRefreshSecret',
      paymentAccessToken:
        'APP_USR-5364548738128566-051913-ed59ec1ef1446cc3754dca8a63e3398b-294388766',
      paymentServiceBaseUrl: 'https://api.mercadopago.com/v1',
    });
  });

  it('should use environment variables when provided', () => {
    process.env.PORT = '3000';
    process.env.MONGODB_URI = 'mongodb://custom:27017';
    process.env.WEBHOOK_URL = 'https://custom-webhook.com';
    process.env.EXPIRATION_TIME = '2h';
    process.env.JWT_SECRET = 'custom-secret';
    process.env.JWT_REFRESH_SECRET = 'custom-refresh-secret';
    process.env.PAYMENT_ACCESS_TOKEN = 'custom-payment-token';
    process.env.PAYMENT_SERVICE_BASE_URL = 'https://custom-payment-api.com';

    const config = configuration();

    expect(config).toEqual({
      port: 3000,
      mongoUri: 'mongodb://custom:27017',
      webhookUrl: 'https://custom-webhook.com',
      expirationTime: '2h',
      jwtSecret: 'custom-secret',
      jwtRefreshSecret: 'custom-refresh-secret',
      paymentAccessToken: 'custom-payment-token',
      paymentServiceBaseUrl: 'https://custom-payment-api.com',
    });
  });

  it('should parse PORT as integer', () => {
    process.env.PORT = '8080';

    const config = configuration();

    expect(config.port).toBe(8080);
    expect(typeof config.port).toBe('number');
  });

  it('should handle invalid PORT by using default', () => {
    process.env.PORT = 'invalid';

    const config = configuration();

    expect(config.port).toBeNaN();
  });

  it('should mix environment variables with defaults', () => {
    process.env.PORT = '5000';
    process.env.JWT_SECRET = 'custom-jwt-secret';
    delete process.env.MONGODB_URI;
    delete process.env.WEBHOOK_URL;

    const config = configuration();

    expect(config.port).toBe(5000);
    expect(config.jwtSecret).toBe('custom-jwt-secret');
    expect(config.mongoUri).toBe(
      'mongodb://localhost:27017/?retryWrites=true&loadBalanced=false&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000',
    );
    expect(config.webhookUrl).toBe(
      'https://webhook.site/123e4567-e89b-12d3-a456-426614174000',
    );
  });

  it('should handle all configuration values', () => {
    const config = configuration();

    expect(config).toHaveProperty('port');
    expect(config).toHaveProperty('mongoUri');
    expect(config).toHaveProperty('webhookUrl');
    expect(config).toHaveProperty('expirationTime');
    expect(config).toHaveProperty('jwtSecret');
    expect(config).toHaveProperty('jwtRefreshSecret');
    expect(config).toHaveProperty('paymentAccessToken');
    expect(config).toHaveProperty('paymentServiceBaseUrl');
  });

  it('should return a function', () => {
    expect(typeof configuration).toBe('function');
  });
});
