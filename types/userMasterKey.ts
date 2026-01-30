export interface UserMasterKeyType {
  passwordKey: string;
  pk_salt: string;
  encryptedMasterKey: { cipher: string; nonce: string; mac: string };
}
