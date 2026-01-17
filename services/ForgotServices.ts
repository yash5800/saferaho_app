import { bytesToHex, decryptData, encryptData, generateKey, recoveryKeyWords2entropy } from "@/util/cryptography";
import axios from "axios";
import Aes from 'react-native-aes-crypto';

const ip_address = "192.168.1.12";

interface RecoverySaltResponse {
  status?: number;
  success: boolean;
  userName?: string;
  recoveryKeyHashSalt?: string;
  nonce?: string;
  rk_salt?: string;
  message?: string;
  field?: string;
}

interface ResetTokenResponse {
  success: boolean;
  field?: string;
  status?: number;
  resetToken?: string;
  message?: string;
  recoveryKey?: string;
  recoveryData?: {
    _id: string;
    accoundName: string;
    accountUUID: string;
    email: string;
    encryptedRecoveryMasterKey: { cipher: string; nonce: string; mac: string };
  };
}

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

interface ForgotPasswordInput {
  newPassword: string;
  resetToken: string;
  recoveryKey: string;
  recoveryData: {
    _id: string;
    accoundName: string;
    accountUUID: string;
    email: string;
    encryptedRecoveryMasterKey: { cipher: string; nonce: string; mac: string };
  };
}

class ForgotPasswordService {

  static async #getRecoverySalt(userInput: string): Promise<RecoverySaltResponse> {
    try{
      const res = await axios.post(`http://${ip_address}:3002/api/forgotpassword/validaterecovery/check1`, {
        userInput
      })

      console.log("Fetched recovery salt response:", res.data);

      if(res.status !== 200){
        return { success: false, status: res.status, message: res.data.message || 'Failed to get recovery salt' };
      }

      return {
        success: true,
        userName: res.data.data.recoveryKeyData.accountName,
        recoveryKeyHashSalt: res.data.data.recoveryKeyData.recoveryKeyHashSalt,
        rk_salt: res.data.data.recoveryKeyData.rk_salt,
        nonce: res.data.data.nonce
      }
    }
    catch(error){
      if(axios.isAxiosError(error) && error.response){
        if(error.response.status === 409 && error.response.data.field === 'userInput'){
          console.error("Conflict error response:", error.response.data);
          return { 
            success: false, 
            field: error.response.data.field , 
            message: error.response.data.message || 'Conflict error occurred while fetching recovery salt',
            status: 409
          };
        }

        console.error("Axios error response:", error.response.data);
        return { success: false, status: error.response.status, message: error.response.data.message || 'An error occurred while fetching recovery salt' };
      }
      console.error("Error fetching recovery salt:", error);
      return { success: false, message: 'An error occurred while fetching recovery salt' };
    }
  }

  static async getResetToken(userInput: string, recoveryKeyPhrases: string): Promise<ResetTokenResponse> {
    try{
      const check1 = await this.#getRecoverySalt(userInput);

      console.log("Recovery salt check response:", check1);

      if(!check1.success && check1.status === 409){
        return { 
          success: false, 
          field: check1.field, 
          message: check1.message || 'Conflict error occurred while fetching recovery salt',
          status: 409
        };
      }
      else if(!check1.success){
        return { success: false, message: check1.message || 'Failed to get recovery salt' };
      }

      if(!check1.nonce || !check1.recoveryKeyHashSalt || !check1.userName || !check1.rk_salt){
        return { success: false, message: 'Failed to get required recovery data' };
      }

      console.log(`Using recovery hash salt: ${check1.recoveryKeyHashSalt} and nonce: ${check1.nonce}`);

      // Generating recovery key from recovery key phrases
      const entropy = recoveryKeyWords2entropy(recoveryKeyPhrases);
      const recoveryKey = await generateKey(bytesToHex(entropy), check1.rk_salt, 1);

      // Generating recovery key hash to validate
      const recoveryKeyHash = await generateKey(recoveryKey, check1.recoveryKeyHashSalt, 1);
      console.log(`Generated recovery key hash: ${recoveryKeyHash}`);

      const proof = await generateKey(recoveryKeyHash, check1.nonce, 1);

      const res = await axios.post(`http://${ip_address}:3002/api/forgotpassword/validaterecovery/check2`, {
        userName: check1.userName,
        proof
      });

      if(res.status !== 200){
        return { success: false, message: res.data.message || 'Failed to validate recovery key' };
      }

      console.log("Fetched reset token response:", res.data);
      return {
        success: true,
        ...res.data.data,
        recoveryKey: recoveryKey
      };
    }
    catch(error){
      if(axios.isAxiosError(error) && error.response){
        if(error.response.status === 409 && error.response.data.message === 'Invalid recovery proof'){
          console.error("Conflict error response:", error.response.data);
          return { 
            success: false, 
            field: 'recoveryKey', 
            message: error.response.data.message || 'Conflict error occurred while fetching reset token',
            status: 409
          };
        }

        console.error("Axios error response:", error.response.data);
        return { success: false, status: error.response.status, message: error.response.data.message || 'An error occurred while fetching reset token' };
      }
      console.error("Error fetching reset token:", error);
      return { 
        success: false, 
        message: 'invalid recovery key provided',
        status: 409,
        field: 'recoveryKey'
      };
    }
  }

  static async forgotPassword(data: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    if(!data.recoveryKey || !data.recoveryData || !data.resetToken || !data.newPassword){
      return { success: false, message: 'Failed to validate recovery key' };
    }

    console.log("Data to decrypt recovery master key:", data.recoveryData);

    try{
      const masterKey = await decryptData(data.recoveryData.encryptedRecoveryMasterKey, data.recoveryKey);

      const new_pk_salt = await Aes.randomKey(16);

      console.log("Forgot - userData:", data.recoveryData.email,data.newPassword, new_pk_salt);
      const newPasswordKey = await generateKey(data.recoveryData.email + data.newPassword, new_pk_salt);

      const new_encryptedMasterKey = await encryptData(masterKey, newPasswordKey);

      const auth_salt = await Aes.randomKey(16);
      
      const authHash = await generateKey(data.newPassword, auth_salt);

      const res = await axios.post(`http://${ip_address}:3002/api/forgotpassword/resetpassword`,{
          userId: data.recoveryData._id,
          newPkSalt: new_pk_salt,
          newEncryptedMasterKey: new_encryptedMasterKey,
          authSalt: auth_salt,
          authHash: authHash
        },
        {
          headers: { Authorization: `Bearer ${data.resetToken}` },
        }
      );

      console.log("Password reset response:", res.data);

      if(res.data.status !== 201){
        return { success: false, message: res.data.message || 'Failed to reset password' };
      }

      // await SecretStorage.storeSecret('masterKeyData', JSON.stringify({
      //   passwordKey: newPasswordKey,
      //   pk_salt: new_pk_salt,
      //   encryptedMasterKey: new_encryptedRecoveryMasterKey
      // }));

      return { 
        success: true, 
        message: 'password is updated successfully'
      }
    }
    catch(error){
      console.error("Error validating recovery key:", error);
      return { success: false, message:'An error occurred while validating recovery key' };
    }
  }
}

export { ForgotPasswordService };
