import * as Keychain from 'react-native-keychain';

// Use a distinct service per key so multiple secrets don't overwrite each other.
const serviceForKey = (key: string) => `com.myapp.secretstorage.${key}`;

class SecretStorage {
  static async storeSecret(key: string, secret: string) {
    await Keychain.setGenericPassword(key, secret, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      service: serviceForKey(key),
    });
  }

  static async retrieveSecret(key: string): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
      service: serviceForKey(key),
    });

    return credentials ? credentials.password : null;
  }

  static async deleteSecret(key: string) {
    await Keychain.resetGenericPassword({
      service: serviceForKey(key),
    });
  }

  static async clearAllSecrets() {
    // Clear known keys used by the app
    await Keychain.resetGenericPassword({ service: serviceForKey('masterKeyData') });
    await Keychain.resetGenericPassword({ service: serviceForKey('refreshToken') });
  }
}

export default SecretStorage;