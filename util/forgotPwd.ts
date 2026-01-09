import { recoveryKeyValidator } from "./cryptography";

interface ForgotPasswordData {
  mnemonic: string,
  rk_salt: string,
  encryptedRecoveryMasterKey: { cipher: string; nonce: string; mac: string }
}

const ForgotPassword = (data: ForgotPasswordData) => {
  const masterKey = recoveryKeyValidator(
    data.mnemonic,
    data.rk_salt,
    data.encryptedRecoveryMasterKey
  );

  return masterKey;
}

export { ForgotPassword };
