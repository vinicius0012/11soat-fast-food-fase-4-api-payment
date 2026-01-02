/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { WebhookGuard } from './webhook.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('WebhookGuard', () => {
  let guard: WebhookGuard;
  let configService: jest.Mocked<ConfigService>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;

  const WEBHOOK_TOKEN = 'valid-webhook-token';

  beforeEach(() => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'WEBHOOK_TOKEN') return WEBHOOK_TOKEN;
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    guard = new WebhookGuard(configService);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;
  });

  describe('canActivate', () => {
    it('should allow access with valid webhook token', () => {
      const mockRequest = {
        headers: {
          'x-webhook-token': WEBHOOK_TOKEN,
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(configService.get).toHaveBeenCalledWith('WEBHOOK_TOKEN');
    });

    it('should throw UnauthorizedException when token is not provided', () => {
      const mockRequest = {
        headers: {},
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Webhook token not provided',
      );
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      const mockRequest = {
        headers: {
          'x-webhook-token': 'invalid-token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Invalid webhook token',
      );
    });

    it('should throw UnauthorizedException when token is empty string', () => {
      const mockRequest = {
        headers: {
          'x-webhook-token': '',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should handle case-sensitive header names correctly', () => {
      const mockRequest = {
        headers: {
          'x-webhook-token': WEBHOOK_TOKEN,
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });

  describe('extractToken', () => {
    it('should extract token from request headers', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockRequest = {
        headers: {
          'x-webhook-token': WEBHOOK_TOKEN,
        },
      } as any;

      const token = guard['extractToken'](mockRequest);

      expect(token).toBe(WEBHOOK_TOKEN);
    });

    it('should return undefined when token header is missing', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockRequest = {
        headers: {},
      } as any;

      const token = guard['extractToken'](mockRequest);

      expect(token).toBeUndefined();
    });
  });
});
