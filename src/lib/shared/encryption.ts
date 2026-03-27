import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { createLogger } from "@/lib/logging";

const logger = createLogger("encryption");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = "enc:";

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns `"enc:" + base64(iv + authTag + ciphertext)` or `null` for null/empty input.
 * Returns plaintext as-is when no key is provided (encryption disabled).
 */
export function encryptField(
  plaintext: string | null | undefined,
  keyHex: string | undefined,
): string | null {
  if (!plaintext) return null;
  if (!keyHex) return plaintext;

  const key = Buffer.from(keyHex, "hex");
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack: IV (12) + authTag (16) + ciphertext
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return PREFIX + packed.toString("base64");
}

/**
 * Decrypts a field encrypted by `encryptField`.
 * If the value doesn't start with `"enc:"`, returns it as-is (legacy plaintext fallback).
 * Returns `null` on decryption failure instead of crashing.
 * Returns plaintext as-is when no key is provided (encryption disabled).
 */
export function decryptField(
  ciphertext: string | null | undefined,
  keyHex: string | undefined,
): string | null {
  if (!ciphertext) return null;
  if (!ciphertext.startsWith(PREFIX)) return ciphertext;
  if (!keyHex) return ciphertext;

  try {
    const packed = Buffer.from(ciphertext.slice(PREFIX.length), "base64");

    const iv = packed.subarray(0, IV_LENGTH);
    const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(
      ALGORITHM,
      Buffer.from(keyHex, "hex"),
      iv,
    );
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    logger.error("Failed to decrypt field", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
