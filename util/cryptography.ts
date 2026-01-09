import { entropyToMnemonic, mnemonicToEntropy } from 'ethereum-cryptography/bip39';
import Aes from 'react-native-aes-crypto';

// const entropy = bip39.mnemonicToEntropy(mnemonic);

import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';
import * as Random from 'expo-random';

const getRandomBytes = async (length: number): Promise<Uint8Array> => {
  return await Random.getRandomBytesAsync(length);
};

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

const generateKey = async (
  text: string,
  salt: string,
  cost = 100_000,
  length = 256
) => {
  const key = await Aes.pbkdf2(text, salt, cost, length, 'sha256');

  console.log(`Generated key of length: ${key.length / 2} bytes`);

  if (key.length !== 64) {
    throw new Error(`Invalid key length: ${key.length / 2} bytes`);
  }

  return key;
};

const encryptData = async (text: string, key: string) => {
  const nonce = await Aes.randomKey(16);

  const cipher = await Aes.encrypt(
    text,
    key,
    nonce,
    'aes-256-cbc'
  )

  const mac = await Aes.hmac256(cipher + nonce, key);

  return {
    cipher,
    nonce,
    mac,
  }

}

const decryptData = async (
  encryptedData: { cipher: string; nonce: string; mac: string },
  key: string
) => {
  const recalculatedMac = await Aes.hmac256(
    encryptedData.cipher + encryptedData.nonce,
    key
  );

  if (recalculatedMac !== encryptedData.mac) {
    throw new Error('Data integrity check failed: MAC mismatch');
  }

  const decryptedText = await Aes.decrypt(
    encryptedData.cipher,
    key,
    encryptedData.nonce,
    'aes-256-cbc'
  );

  return decryptedText;
};

const recoveryKeyGenerator = async (masterKey: string, salt: string) => {
  const entropy = await getRandomBytes(32);
  const mnemonic = entropyToMnemonic(entropy, wordlist);

  console.log(`Generated mnemonic: ${mnemonic}`);

  const recoveryKey = await generateKey(bytesToHex(entropy), salt, 1);

  const encryptedRecoveryMasterKey = await encryptData(masterKey, recoveryKey);

  return {
    mnemonic,
    encryptedRecoveryMasterKey,
  }
}

const recoveryKeyValidator = async (
  mnemonic: string,
  rk_salt: string,
  encryptedRecoveryMasterKey: { cipher: string; nonce: string; mac: string }
) => {
  const entropy = mnemonicToEntropy(mnemonic, wordlist);

  const recoveryKey = await generateKey(bytesToHex(entropy), rk_salt, 1);

  const masterKey = await decryptData(encryptedRecoveryMasterKey, recoveryKey);

  return masterKey;
}

export { decryptData, encryptData, generateKey, recoveryKeyGenerator, recoveryKeyValidator };

