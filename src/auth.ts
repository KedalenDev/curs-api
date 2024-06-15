import id from 'nanoid'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const encryptionKey = process.env.ENCRYPTION_KEY!;

async function encryptAPIKey(
  key: string
) : Promise<string> {
  //Encrypt the key using the encryptionKey
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-ctr', Buffer.from(encryptionKey), iv);
  let encrypted = cipher.update(key);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

async function decryptAPIKey(
  key: string
) : Promise<string> {
  //Decrypt the key using the encryptionKey
  const parts = key.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = createDecipheriv('aes-256-ctr', Buffer.from(encryptionKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function generateKey() {
  const key = id.nanoid();
  console.log('Generated key:', key);
  return await encryptAPIKey(key);
}