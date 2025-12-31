import { Controller, Post } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Post()
  health() {
    return JSON.stringify({
      message: '200 OK',
    });
  }
}
