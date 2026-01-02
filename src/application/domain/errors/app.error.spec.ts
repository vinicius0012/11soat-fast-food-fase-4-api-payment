import { AppError } from './app.error';
import { HttpStatus } from './http.exception';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create AppError with all parameters', () => {
      const error = new AppError({
        message: 'Test error',
        statusCode: HttpStatus.BAD_REQUEST,
        errorType: 'TestError',
        details: { field: 'test' },
      });

      expect(error.message).toContain('Test error');
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.errorType).toBe('TestError');
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should use default values when not provided', () => {
      const error = new AppError({
        message: 'Default error',
      });

      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.errorType).toBe('ApplicationError');
    });

    it('should be instance of Error', () => {
      const error = new AppError({
        message: 'Test',
      });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('notFound', () => {
    it('should create 404 error', () => {
      const error = AppError.notFound({
        message: 'Resource not found',
      });

      expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(error.errorType).toBe('NotFoundError');
      expect(error.message).toContain('Resource not found');
    });

    it('should create not found error with details', () => {
      const error = AppError.notFound({
        message: 'User not found',
        details: { userId: 123 },
      });

      expect(error.details).toEqual({ userId: 123 });
    });
  });

  describe('badRequest', () => {
    it('should create 400 error', () => {
      const error = AppError.badRequest({
        message: 'Invalid input',
      });

      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.errorType).toBe('BadRequestError');
      expect(error.message).toContain('Invalid input');
    });

    it('should create bad request error with validation details', () => {
      const error = AppError.badRequest({
        message: 'Validation failed',
        details: { fields: ['email', 'password'] },
      });

      expect(error.details).toEqual({ fields: ['email', 'password'] });
    });
  });

  describe('unauthorized', () => {
    it('should create 401 error', () => {
      const error = AppError.unauthorized({
        message: 'Authentication required',
      });

      expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.errorType).toBe('UnauthorizedError');
      expect(error.message).toContain('Authentication required');
    });

    it('should create unauthorized error with details', () => {
      const error = AppError.unauthorized({
        message: 'Invalid token',
        details: { token: 'expired' },
      });

      expect(error.details).toEqual({ token: 'expired' });
    });
  });

  describe('forbidden', () => {
    it('should create 403 error', () => {
      const error = AppError.forbidden({
        message: 'Access denied',
      });

      expect(error.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(error.errorType).toBe('ForbiddenError');
      expect(error.message).toContain('Access denied');
    });

    it('should create forbidden error with details', () => {
      const error = AppError.forbidden({
        message: 'Insufficient permissions',
        details: { requiredRole: 'admin' },
      });

      expect(error.details).toEqual({ requiredRole: 'admin' });
    });
  });

  describe('conflict', () => {
    it('should create 409 error', () => {
      const error = AppError.conflict({
        message: 'Resource already exists',
      });

      expect(error.statusCode).toBe(HttpStatus.CONFLICT);
      expect(error.errorType).toBe('ConflictError');
      expect(error.message).toContain('Resource already exists');
    });

    it('should create conflict error with details', () => {
      const error = AppError.conflict({
        message: 'Email already in use',
        details: { email: 'test@example.com' },
      });

      expect(error.details).toEqual({ email: 'test@example.com' });
    });
  });

  describe('internal', () => {
    it('should create 500 error', () => {
      const error = AppError.internal({
        message: 'Internal server error',
      });

      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.errorType).toBe('InternalServerError');
      expect(error.message).toContain('Internal server error');
    });

    it('should create internal error with details', () => {
      const error = AppError.internal({
        message: 'Database error',
        details: { code: 'ECONNREFUSED' },
      });

      expect(error.details).toEqual({ code: 'ECONNREFUSED' });
    });
  });

  describe('response property', () => {
    it('should include all fields in response', () => {
      const error = AppError.badRequest({
        message: 'Test error',
        details: { field: 'value' },
      });

      const response = error.response as {
        message: string;
        statusCode: number;
        error: string;
        details: unknown;
      };
      expect(response.message).toBe('Test error');
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.error).toBe('BadRequestError');
      expect(response.details).toEqual({ field: 'value' });
    });

    it('should not include details when not provided', () => {
      const error = AppError.notFound({
        message: 'Not found',
      });

      const response = error.response as {
        message: string;
        statusCode: number;
        error: string;
        details?: unknown;
      };
      expect(response.details).toBeUndefined();
    });
  });

  describe('Error types', () => {
    it('should have correct error type for each static method', () => {
      const errors = [
        {
          method: (params: { message: string }) => AppError.notFound(params),
          type: 'NotFoundError',
        },
        {
          method: (params: { message: string }) => AppError.badRequest(params),
          type: 'BadRequestError',
        },
        {
          method: (params: { message: string }) =>
            AppError.unauthorized(params),
          type: 'UnauthorizedError',
        },
        {
          method: (params: { message: string }) => AppError.forbidden(params),
          type: 'ForbiddenError',
        },
        {
          method: (params: { message: string }) => AppError.conflict(params),
          type: 'ConflictError',
        },
        {
          method: (params: { message: string }) => AppError.internal(params),
          type: 'InternalServerError',
        },
      ];

      errors.forEach(({ method, type }) => {
        const error = method({ message: 'Test' });
        expect(error.errorType).toBe(type);
      });
    });
  });
});
