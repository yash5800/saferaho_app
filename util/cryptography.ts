import {
  entropyToMnemonic,
  mnemonicToEntropy,
} from "ethereum-cryptography/bip39";
import Aes from "react-native-aes-crypto";

// const entropy = bip39.mnemonicToEntropy(mnemonic);

import { wordlist } from "ethereum-cryptography/bip39/wordlists/english";
import * as Random from "expo-random";

const getRandomBytes = async (length: number): Promise<Uint8Array> => {
  return await Random.getRandomBytesAsync(length);
};

export const deriveKeys = (masterKey: string) => {
  if (masterKey.length !== 64) {
    throw new Error(`Invalid master key length: ${masterKey.length / 2} bytes`);
  }
  return {
    encKey: masterKey.slice(0, 32),
    macKey: masterKey.slice(32, 96),
  };
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const generateKey = async (
  text: string,
  salt: string,
  cost = 100_000,
  length = 256,
) => {
  const key = await Aes.pbkdf2(text, salt, cost, length, "sha256");

  console.log(`Generated key of length: ${key.length / 2} bytes`);

  if (key.length !== 64) {
    throw new Error(`Invalid key length: ${key.length / 2} bytes`);
  }

  return key;
};

const encryptData = async (text: string, key: string) => {
  const nonce = await Aes.randomKey(16);

  const cipher = await Aes.encrypt(text, key, nonce, "aes-256-cbc");

  const mac = await Aes.hmac256(cipher + nonce, key);

  return {
    cipher,
    nonce,
    mac,
  };
};

const decryptData = async (
  encryptedData: { cipher: string; nonce: string; mac: string },
  key: string,
) => {
  console.log(
    "Decrypting data with key of length:",
    key,
    "and encrypted data:",
    encryptedData,
  );
  const recalculatedMac = await Aes.hmac256(
    encryptedData.cipher + encryptedData.nonce,
    key,
  );

  if (recalculatedMac !== encryptedData.mac) {
    throw new Error("Data integrity check failed: MAC mismatch");
  }

  const decryptedText = await Aes.decrypt(
    encryptedData.cipher,
    key,
    encryptedData.nonce,
    "aes-256-cbc",
  );

  return decryptedText;
};

const recoveryKeyGenerator = async (masterKey: string, salt: string) => {
  const entropy = await getRandomBytes(32);
  const mnemonic = entropyToMnemonic(entropy, wordlist);

  console.log(`Generated mnemonic: ${mnemonic}`);

  const recoveryKey = await generateKey(bytesToHex(entropy), salt, 1);

  const recoveryKeyHashSalt = await Aes.randomKey(16);
  const recoveryKeyHash = await generateKey(
    recoveryKey,
    recoveryKeyHashSalt,
    1,
  );

  console.log(`Generated recovery key hash: ${recoveryKeyHash}`);

  const encryptedRecoveryMasterKey = await encryptData(masterKey, recoveryKey);

  return {
    mnemonic,
    encryptedRecoveryMasterKey,
    recoveryKeyHashSalt,
    recoveryKeyHash,
  };
};

const recoveryKeyWords2entropy = (mnemonic: string): Uint8Array => {
  try {
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    return entropy;
  } catch (error) {
    throw new Error("Invalid mnemonic phrase");
  }
};

const recoveryKeyValidator = async (
  mnemonic: string,
  rk_salt: string,
  encryptedRecoveryMasterKey: { cipher: string; nonce: string; mac: string },
) => {
  const entropy = mnemonicToEntropy(mnemonic, wordlist);

  const recoveryKey = await generateKey(bytesToHex(entropy), rk_salt, 1);

  const masterKey = await decryptData(encryptedRecoveryMasterKey, recoveryKey);

  return masterKey;
};

const encryptChunk = async (chunk: string, encKey: string, macKey: string) => {
  const nonce = await Aes.randomKey(16);

  const cipher = await Aes.encrypt(chunk, encKey, nonce, "aes-256-cbc");

  const mac = await Aes.hmac256(cipher + nonce, macKey);

  return {
    cipher,
    nonce,
    mac,
  };
};

const decryptChunk = async (
  encryptedChunk: { cipher: string; nonce: string; mac: string },
  encKey: string,
  macKey: string,
) => {
  const recalculatedMac = await Aes.hmac256(
    encryptedChunk.cipher + encryptedChunk.nonce,
    macKey,
  );

  if (recalculatedMac !== encryptedChunk.mac) {
    throw new Error("Chunk integrity check failed: MAC mismatch");
  }

  const decryptedChunk = await Aes.decrypt(
    encryptedChunk.cipher,
    encKey,
    encryptedChunk.nonce,
    "aes-256-cbc",
  );

  return decryptedChunk;
};

async function encryptPreview(base64Preview: string, masterKey: string) {
  const previewKey = await Aes.randomKey(32);
  const { encKey, macKey } = deriveKeys(previewKey);

  console.log("Generated preview key.", previewKey);

  const encrypted = await encryptChunk(base64Preview, encKey, macKey);

  console.log("Encrypted preview.", encrypted);

  // encrypt previewKey with masterKey
  const { encKey: mkEnc, macKey: mkMac } = deriveKeys(masterKey);
  const encryptedPreviewKey = await encryptChunk(previewKey, mkEnc, mkMac);

  console.log("Encrypted preview generated key.", encryptedPreviewKey);

  return {
    encryptedPreview: encrypted,
    encryptedPreviewKey,
    version: "preview-aes-cbc-hmac-v1",
  };
}

async function decryptPreview(
  encryptedPreview: { cipher: string; nonce: string; mac: string },
  encryptedPreviewKey: { cipher: string; nonce: string; mac: string },
  masterKey: string,
) {
  console.log("Decrypting preview...", encryptedPreviewKey);
  // decrypt previewKey with masterKey
  const { encKey: mkEnc, macKey: mkMac } = deriveKeys(masterKey);
  const previewKey = await decryptChunk(encryptedPreviewKey, mkEnc, mkMac);

  console.log("Decrypted preview key.", previewKey);
  const { encKey, macKey } = deriveKeys(previewKey);
  console.log("encryption for preview decryption.", encryptPreview);

  const base64Preview = await decryptChunk(encryptedPreview, encKey, macKey);

  return base64Preview;
}

export {
  decryptChunk,
  decryptData,
  decryptPreview,
  encryptChunk,
  encryptData,
  encryptPreview,
  generateKey,
  recoveryKeyGenerator,
  recoveryKeyValidator,
  recoveryKeyWords2entropy
};

