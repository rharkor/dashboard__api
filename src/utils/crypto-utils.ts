import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.PASSWORD_ENCRYPTION_KEY as string;
if (!secretKey) throw new Error('PASSWORD_ENCRYPTION_KEY is not defined');
const keyLength = 32;
const ivLength = 16;

const secretKeyHashed = crypto
  .createHash('sha256')
  .update(String(process.env.SECRET_KEY))
  .digest('hex')
  .substring(0, keyLength);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKeyHashed, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
  const [ivText, encryptedText] = text.split(':');
  const iv = Buffer.from(ivText, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKeyHashed, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
