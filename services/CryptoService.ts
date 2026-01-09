import { decryptData } from '@/util/cryptography';
import * as LocalAuthentication from 'expo-local-authentication';
import SecretStorage from '../storage/SecretStorage';

class CryptoService {
  static async unlockMasterKey(){
    const auth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock SafeRaho',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    })

    console.log('auth:', auth)

    if(!auth.success && auth.error !== 'not_enrolled') return null;

    const rawMasterKeyData = await SecretStorage.retrieveSecret('masterKeyData');

    console.log("Retrieved masterKeyData from SecretStorage:", rawMasterKeyData);

    console.log(await SecretStorage.retrieveSecret('refreshToken'));

    if(!rawMasterKeyData) return null;

      // SecretStorage.storeSecret('masterKeyData', JSON.stringify({
      //   passwordKey,
      //   pk_salt,
      //   encryptedMasterKey
      // }));

    const masterKeyData = JSON.parse(rawMasterKeyData);

    const masterKey = await decryptData(masterKeyData.encryptedMasterKey, masterKeyData.passwordKey);

    console.log("Decrypted masterKey:", masterKey);

    return masterKey;
  }
  
}


export default CryptoService;