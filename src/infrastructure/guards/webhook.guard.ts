import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Webhook token not provided');
    }

    if (token !== this.configService.get<string>('WEBHOOK_TOKEN')) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    return request.headers['x-webhook-token'] as string;
  }
}
