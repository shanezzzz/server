export interface IEncryptionService {
  encrypt(text: string): string;
  decrypt(encryptedText: string): string;
  hash(text: string): string;
  compareHash(text: string, hash: string): boolean;
  encryptObject<T extends object>(obj: T, sensitiveFields: (keyof T)[]): T;
  decryptObject<T extends object>(obj: T, sensitiveFields: (keyof T)[]): T;
}
