/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  describe('health', () => {
    it('should return health status with 200 OK message', () => {
      const result = controller.health();

      expect(result).toBe(
        JSON.stringify({
          message: '200 OK',
        }),
      );
    });

    it('should return a valid JSON string', () => {
      const result = controller.health();

      expect(() => JSON.parse(result)).not.toThrow();

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('message');
      expect(parsed.message).toBe('200 OK');
    });
  });
});
