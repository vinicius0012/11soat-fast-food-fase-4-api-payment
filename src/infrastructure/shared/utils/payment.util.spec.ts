import { generatePaymentUUID } from './payment.util';

describe('payment.util', () => {
  describe('generatePaymentUUID', () => {
    it('should generate a valid UUID v4 format', () => {
      const uuid = generatePaymentUUID();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generatePaymentUUID();
      const uuid2 = generatePaymentUUID();
      const uuid3 = generatePaymentUUID();

      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });

    it('should always have correct UUID structure', () => {
      const uuid = generatePaymentUUID();
      const parts = uuid.split('-');

      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);
    });

    it('should have version 4 indicator', () => {
      const uuid = generatePaymentUUID();
      const versionChar = uuid.charAt(14); // Position of version in UUID

      expect(versionChar).toBe('4');
    });

    it('should have valid variant bits', () => {
      const uuid = generatePaymentUUID();
      const variantChar = uuid.charAt(19); // Position of variant in UUID

      expect(['8', '9', 'a', 'b']).toContain(variantChar.toLowerCase());
    });

    it('should generate 100 unique UUIDs', () => {
      const uuids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        uuids.add(generatePaymentUUID());
      }

      expect(uuids.size).toBe(100);
    });

    it('should only contain valid hexadecimal characters and hyphens', () => {
      const uuid = generatePaymentUUID();
      const validCharsRegex = /^[0-9a-f-]+$/i;

      expect(uuid).toMatch(validCharsRegex);
    });
  });
});
