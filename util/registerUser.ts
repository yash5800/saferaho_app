import { storage } from '@/storage/mmkv';
import SecretStorage from '@/storage/SecretStorage';
import axios from 'axios';
import Aes from 'react-native-aes-crypto';
import { encryptData, generateKey, recoveryKeyGenerator } from './cryptography';

interface RegisterUserData {
  userName: string;
  password: string;
  email: string;
}

interface UserExistsResponse {
  type: string;
  field?: string;
  message: string;
}

const ip_address = "192.168.1.12";

const registerUserExists = async (userName: string, email: string): Promise<UserExistsResponse> => {
  // Placeholder for checking if a user already exists.
  // In a real application, this would query a database or an API.

  try{
    const checkRes = await axios.post(`http://${ip_address}:3002/api/signup/check`, {
      accountName: userName,
      email: email
    });

    if(checkRes.data.confirmationRequired){
        return { type: 'success', message: 'new user can be registered' }
    }
    else{
        return { type: 'none', message: 'placeholder responses' }
    }
    
  }
  catch(error){
      if(axios.isAxiosError(error)) {
        if(error.response?.data?.message === "User already exists with this email"){
            return { type: 'error', field: 'email', message: 'User already exists with this email' }
        }
        else if(error.response?.data?.message === "User already exists with this account name"){
            return { type: 'error', field: 'userName', message: 'User already exists with this account name' }
        }
     }
    console.error("Error checking user existence:", error);
    return {
      type: 'unknown error',
      message: 'An unknown error occurred while checking user existence'
    }
  }
}

//TODO: future update
const registerUser =  async (data: RegisterUserData) => {
  
  console.log("Generating authentication key...");
  
  const auth_salt = await Aes.randomKey(16);
  
  const authHash = await generateKey(data.password, auth_salt);

  console.log("Authentication hash:", authHash);
  
  console.log("Generating password key...");

  const pk_salt = await Aes.randomKey(16);
  
  const passwordKey = await generateKey(data.email + data.password, pk_salt);

  console.log("Generating master key...");

  const masterKey = await Aes.randomKey(32);
  console.log(masterKey);

  const encryptedMasterKey = await encryptData(masterKey, passwordKey);

  console.log("Generating recovery key...");

  const rk_salt = await Aes.randomKey(16);

  const recoveryKeyData = await recoveryKeyGenerator(masterKey, rk_salt);

  try{
    const res = await axios.post(`http://${ip_address}:3002/api/signup/register`, {
      accountType: 'general',
      accountName: data.userName,
      email: data.email,
      pk_salt: pk_salt,
      encryptedMasterKey: encryptedMasterKey,
      rk_salt: rk_salt,
      encryptedRecoveryMasterKey: recoveryKeyData.encryptedRecoveryMasterKey,
      auth_salt: auth_salt,
      authHash: authHash
    });

    console.log("Registration response:", res.data);

    if(res.status === 201){
      const userData = res.data.data;

      const userProfile = {
        userName : userData.accountName,
        email: userData.email,
        id: userData._id,
        userUUID: userData.userUUID,
        createdAt: new Date(userData._createdAt)
      }

      console.log("Storing user profile locally...");

      storage.set('userProfile', JSON.stringify(userProfile));

      //TODO : set default settings
      storage.set('userSeittngs', JSON.stringify({
        darkMode: false,
        biometricAuth: false,
        notificationsEnabled: false,
        // other settings can be added here like 2FA, notifications, etc.
      }));

      storage.set('accessToken', res.data.tokens.accessToken);

      //TODO : store userValutData

      // storage.set('userVaultData', JSON.stringify({
      //   // initial vault data structure
      // }));

      // TODO : store user files metadata

      console.log("Storing masterKeyData and refreshToken in SecretStorage.");

      await SecretStorage.storeSecret('masterKeyData', JSON.stringify({
        passwordKey,
        pk_salt,
        encryptedMasterKey
      }));
      
      await SecretStorage.storeSecret('refreshToken', res.data.tokens.refreshToken);

      return {
        type: 'success',
        userProfile,
        message: 'User registered successfully'
      }
    }
    else{
      return {
        type: 'error',
        message: 'Failed to register user'
      }
    }
  }
  catch(error){
    if(axios.isAxiosError(error)) {
        return {
            type: 'error',
            message: error.response?.data?.message || 'An error occurred during registration'
        }
    }
    console.error("Error registering user:", error);

    return {
      type: 'unknown error',
      message: 'An unknown error occurred during registration'
    }
  }
}


export { registerUser, registerUserExists };

