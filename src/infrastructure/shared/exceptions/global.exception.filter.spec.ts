/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { GlobalExceptionFilter } from './global.exception.filter';
import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { AppError } from 'src/application/domain/errors/app.error';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      method: 'GET',
      url: '/test',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as jest.Mocked<ArgumentsHost>;

    filter = new GlobalExceptionFilter();

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('should handle AppError with proper status and message', () => {
      const appError = AppError.notFound({ message: 'Resource not found' });

      filter.catch(appError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
        error: 'NotFoundError',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should handle AppError.badRequest', () => {
      const appError = AppError.badRequest({ message: 'Invalid input' });

      filter.catch(appError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid input',
        error: 'BadRequestError',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should handle AppError.unauthorized', () => {
      const appError = AppError.unauthorized({
        message: 'Unauthorized access',
      });

      filter.catch(appError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized access',
        error: 'UnauthorizedError',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should handle AppError.internal', () => {
      const appError = AppError.internal({
        message: 'Internal server error',
        details: 'Database connection failed',
      });

      filter.catch(appError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should handle generic Error instances', () => {
      const error = new Error('Something went wrong');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        error: 'Error',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should handle exceptions with status property', () => {
      const exception = {
        status: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Internal server error',
        error: 'InternalServerError',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should handle unknown exceptions', () => {
      const exception = 'string error';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should log the error', () => {
      const appError = AppError.notFound({ message: 'Resource not found' });
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      filter.catch(appError, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'GET /test - 404: Resource not found',
        expect.any(String),
      );
    });

    it('should handle AppError with string response body', () => {
      // Create a custom AppError with string response
      const error = new AppError({
        message: 'Test error',
        statusCode: HttpStatus.BAD_REQUEST,
        errorType: 'TestError',
      });

      // Mock response property to be a string
      Object.defineProperty(error, 'response', {
        value: 'String error message',
        writable: true,
      });

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'String error message',
        error: 'InternalServerError',
        timestamp: expect.any(String),
        path: '/test',
      });
    });

    it('should include timestamp in ISO format', () => {
      const appError = AppError.notFound({ message: 'Not found' });

      filter.catch(appError, mockArgumentsHost);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should include request path in error response', () => {
      mockRequest.url = '/api/v1/payments/123';
      const appError = AppError.notFound({ message: 'Payment not found' });

      filter.catch(appError, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/payments/123',
        }),
      );
    });
  });
});
