import { randomBytes } from 'crypto';

export function generatePaymentUUID(): string {
  const randomBuffer = randomBytes(16);
  randomBuffer[6] = (randomBuffer[6] & 0x0f) | 0x40;
  randomBuffer[8] = (randomBuffer[8] & 0x3f) | 0x80;
  const hexString = randomBuffer.toString('hex');

  return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}`;
}
