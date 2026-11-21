import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Application-level encryption for sensitive gift-card e-codes.
 *
 * Codes are encrypted with AES-256-GCM before they touch MongoDB so they are
 * never stored as plaintext. The key is derived deterministically from
 * ECODE_ENCRYPTION_KEY (falling back to JWT_SECRET so encryption is always
 * active even when the optional env var is absent).
 */
function deriveKey(): Buffer {
  const material = env.ecodeEncryptionKey || env.jwtSecret;
  return crypto.createHash('sha256').update(material).digest();
}

/** Encrypt a plaintext secret. Returns a base64 payload (iv ‖ authTag ‖ ciphertext). */
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

/** Decrypt a payload produced by `encryptSecret`. Throws on tampering. */
export function decryptSecret(payload: string): string {
  const data = Buffer.from(payload, 'base64');
  if (data.length <= 28) {
    throw new Error('Invalid encrypted payload.');
  }
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

/** A safe display mask that never reveals the full code. */
export function maskCode(code: string): string {
  const clean = code.trim();
  if (clean.length <= 4) return '••••';
  return `•••• •••• ${clean.slice(-4)}`;
}
