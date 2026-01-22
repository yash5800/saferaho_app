import Sodium from "react-native-libsodium";

const FILE_KEY_BYTES = 32; // REQUIRED

export async function deriveFileKey(masterKey: string) {
  await Sodium.ready;

  const salt = Sodium.randombytes_buf(Sodium.crypto_pwhash_SALTBYTES);
  console.log("salt:", salt);

  const key = Sodium.crypto_pwhash(
    FILE_KEY_BYTES, // ✅ must be number
    masterKey,
    salt,
    Sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    Sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    Sodium.crypto_pwhash_ALG_DEFAULT,
  );

  return {
    key,
    salt: Sodium.to_base64(salt),
  };
}
