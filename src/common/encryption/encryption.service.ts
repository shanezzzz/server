import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { IEncryptionService } from './interfaces/encryption.interface';

@Injectable()
export class EncryptionService implements IEncryptionService {
  private readonly secret: string;
  private readonly algorithm: string;
  private readonly encoding: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('encryption.secret');
    this.algorithm = this.configService.get<string>(
      'encryption.algorithm',
      'AES',
    );
    this.encoding = this.configService.get<string>(
      'encryption.encoding',
      'base64',
    );

    if (!this.secret) {
      throw new Error('Encryption secret is not configured');
    }
  }

  encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, this.secret);
      return encrypted.toString();
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secret);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }

  compareHash(text: string, hash: string): boolean {
    const computedHash = this.hash(text);
    return computedHash === hash;
  }

  encryptObject<T extends object>(obj: T, sensitiveFields: (keyof T)[]): T {
    const encryptedObj = { ...obj };
    for (const field of sensitiveFields) {
      if (typeof encryptedObj[field] === 'string') {
        encryptedObj[field] = this.encrypt(
          encryptedObj[field] as string,
        ) as any;
      }
    }
    return encryptedObj;
  }

  decryptObject<T extends object>(obj: T, sensitiveFields: (keyof T)[]): T {
    const decryptedObj = { ...obj };
    for (const field of sensitiveFields) {
      if (typeof decryptedObj[field] === 'string') {
        decryptedObj[field] = this.decrypt(
          decryptedObj[field] as string,
        ) as any;
      }
    }
    return decryptedObj;
  }
}
