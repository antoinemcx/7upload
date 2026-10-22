import { createDecipheriv, scryptSync } from "node:crypto";
import { AUTH_TAG_LENGTH, IV_LENGTH, SALT_LENGTH } from "../consts.ts";

/** Creates a decipher for an encrypted file. */
export function createFileDecipher(cryptdata: Uint8Array, password: string) {
  const salt = cryptdata.subarray(0, SALT_LENGTH);
  const iv = cryptdata.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = cryptdata.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
  );
  const decipher = createDecipheriv("aes-256-gcm", scryptSync(password, salt, 32), iv);
  decipher.setAuthTag(authTag);
  return decipher;
}
