export interface EncryptionConfig {
  secret: string;
  algorithm?: string;
  encoding?: string;
  ivLength?: number;
}
