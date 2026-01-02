import { HttpException, HttpStatus } from './http.exception';

describe('HttpException', () => {
  describe('constructor with string response', () => {
    it('should create exception with string message', () => {
      const message = 'Test error message';
      const statusCode = HttpStatus.BAD_REQUEST;

      const exception = new HttpException(message, statusCode);

      expect(exception.message).toBe(message);
      expect(exception.statusCode).toBe(statusCode);
      expect(exception.response).toEqual({
        statusCode,
        message,
      });
    });

    it('should set correct status code for 404', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      expect(exception.statusCode).toBe(404);
      expect(exception.response.statusCode).toBe(404);
    });

    it('should set correct status code for 500', () => {
      const exception = new HttpException(
        'Internal error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      expect(exception.statusCode).toBe(500);
      expect(exception.response.statusCode).toBe(500);
    });
  });

  describe('constructor with object response', () => {
    it('should create exception with full response object', () => {
      const response = {
        message: 'Validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'ValidationError',
        details: { field: 'email', reason: 'invalid format' },
      };

      const exception = new HttpException(response, HttpStatus.BAD_REQUEST);

      expect(exception.message).toBe('Validation failed');
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.response).toEqual(response);
    });

    it('should handle response without optional fields', () => {
      const response = {
        message: 'Simple error',
        statusCode: HttpStatus.UNAUTHORIZED,
      };

      const exception = new HttpException(response, HttpStatus.UNAUTHORIZED);

      expect(exception.response).toEqual(response);
      expect(exception.response.error).toBeUndefined();
      expect(exception.response.details).toBeUndefined();
    });

    it('should include details in response', () => {
      const details = {
        timestamp: new Date().toISOString(),
        path: '/api/test',
      };
      const response = {
        message: 'Error with details',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        details,
      };

      const exception = new HttpException(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      expect(exception.response.details).toEqual(details);
    });
  });

  describe('Error properties', () => {
    it('should be instance of Error', () => {
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it('should capture correct stack trace', () => {
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      expect(exception.stack).toBeDefined();
      // Stack trace should not include the constructor itself
      expect(exception.stack?.split('\n')[0]).toContain('Error');
    });
  });

  describe('HttpStatus enum', () => {
    it('should have correct success status codes', () => {
      expect(HttpStatus.SUCCESS).toBe(200);
      expect(HttpStatus.CREATED).toBe(201);
      expect(HttpStatus.ACCEPTED).toBe(202);
      expect(HttpStatus.NO_CONTENT).toBe(204);
      expect(HttpStatus.NOT_MODIFIED).toBe(304);
    });

    it('should have correct client error status codes', () => {
      expect(HttpStatus.BAD_REQUEST).toBe(400);
      expect(HttpStatus.UNAUTHORIZED).toBe(401);
      expect(HttpStatus.PAYMENT_REQUIRED).toBe(402);
      expect(HttpStatus.FORBIDDEN).toBe(403);
      expect(HttpStatus.NOT_FOUND).toBe(404);
      expect(HttpStatus.METHOD_NOT_ALLOWED).toBe(405);
      expect(HttpStatus.CONFLICT).toBe(409);
    });

    it('should have correct server error status codes', () => {
      expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
      expect(HttpStatus.BAD_GATEWAY).toBe(502);
      expect(HttpStatus.SERVICE_UNAVAILABLE).toBe(503);
      expect(HttpStatus.GATEWAY_TIMEOUT).toBe(504);
      expect(HttpStatus.HTTP_VERSION_NOT_SUPPORTED).toBe(505);
    });
  });

  describe('Different status codes', () => {
    it('should create exception with UNAUTHORIZED status', () => {
      const exception = new HttpException(
        'Unauthorized access',
        HttpStatus.UNAUTHORIZED,
      );

      expect(exception.statusCode).toBe(401);
    });

    it('should create exception with FORBIDDEN status', () => {
      const exception = new HttpException(
        'Access forbidden',
        HttpStatus.FORBIDDEN,
      );

      expect(exception.statusCode).toBe(403);
    });

    it('should create exception with CONFLICT status', () => {
      const exception = new HttpException(
        'Resource conflict',
        HttpStatus.CONFLICT,
      );

      expect(exception.statusCode).toBe(409);
    });

    it('should create exception with SERVICE_UNAVAILABLE status', () => {
      const exception = new HttpException(
        'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );

      expect(exception.statusCode).toBe(503);
    });
  });
});
